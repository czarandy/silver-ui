import {fireEvent, render, screen, waitFor} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {useState} from 'react';
import {
  beforeAll,
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  type MockInstance,
  vi,
} from 'vitest';
import {Button} from 'components/Button';
import {Lightbox, type LightboxMedia} from 'components/Lightbox/Lightbox';
import {useLightbox} from 'components/Lightbox/useLightbox';

const media: ReadonlyArray<LightboxMedia> = [
  {alt: 'First image', src: '/first.jpg'},
  {alt: 'Second image', src: '/second.jpg'},
  {alt: 'Third image', src: '/third.jpg'},
];

const video: LightboxMedia = {
  alt: 'Demo video',
  captionsSrc: '/captions.vtt',
  src: '/demo.mp4',
  type: 'video',
};

let showModalSpy: MockInstance<() => void>;
let closeSpy: MockInstance<() => void>;

function getMediaViewport(element: HTMLElement): HTMLElement {
  // eslint-disable-next-line testing-library/no-node-access -- media gestures are handled by the viewport wrapper
  const parent = element.parentElement;
  if (parent == null) {
    throw new Error('Expected media element to have a viewport parent.');
  }
  return parent;
}

beforeAll(() => {
  Object.defineProperty(HTMLDialogElement.prototype, 'showModal', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.setAttribute('open', '');
    },
  });
  Object.defineProperty(HTMLDialogElement.prototype, 'close', {
    configurable: true,
    value(this: HTMLDialogElement) {
      this.removeAttribute('open');
    },
  });
});

beforeEach(() => {
  showModalSpy = vi.spyOn(HTMLDialogElement.prototype, 'showModal');
  closeSpy = vi.spyOn(HTMLDialogElement.prototype, 'close');
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('Lightbox', () => {
  it('opens, closes, and returns focus to the trigger element', async () => {
    function Fixture(): React.JSX.Element {
      const [isOpen, setIsOpen] = useState(false);
      return (
        <>
          <Button label="Open preview" onClick={() => setIsOpen(true)} />
          <Button label="Close preview" onClick={() => setIsOpen(false)} />
          <Lightbox isOpen={isOpen} media={media[0]} onOpenChange={setIsOpen} />
        </>
      );
    }

    render(<Fixture />);

    screen.getByRole('button', {name: 'Open preview'}).focus();
    fireEvent.click(screen.getByRole('button', {name: 'Open preview'}));

    expect(showModalSpy).toHaveBeenCalled();
    expect(
      screen.getByRole('dialog', {name: 'Media lightbox'}),
    ).toHaveAttribute('open');

    fireEvent.click(screen.getByRole('button', {name: 'Close preview'}));

    expect(closeSpy).toHaveBeenCalled();
    await waitFor(() => {
      expect(screen.getByRole('button', {name: 'Open preview'})).toHaveFocus();
    });
  });

  it('requests close on backdrop click and cancel events', () => {
    const onOpenChange = vi.fn();
    render(<Lightbox isOpen media={media[0]} onOpenChange={onOpenChange} />);

    fireEvent.click(screen.getByRole('dialog', {name: 'Media lightbox'}));
    expect(onOpenChange).toHaveBeenCalledWith(false);

    const cancelEvent = new Event('cancel', {cancelable: true});
    screen
      .getByRole('dialog', {name: 'Media lightbox'})
      .dispatchEvent(cancelEvent);

    expect(cancelEvent.defaultPrevented).toBe(true);
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it('navigates galleries with arrow keys and buttons while respecting bounds', async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    const {rerender} = render(
      <Lightbox
        index={0}
        isOpen
        media={media}
        onIndexChange={onIndexChange}
        onOpenChange={() => {}}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Previous'}),
    ).not.toBeInTheDocument();
    fireEvent.keyDown(screen.getByRole('dialog'), {key: 'ArrowLeft'});
    expect(onIndexChange).not.toHaveBeenCalled();

    fireEvent.keyDown(screen.getByRole('dialog'), {key: 'ArrowRight'});
    expect(onIndexChange).toHaveBeenLastCalledWith(1);

    await user.click(screen.getByRole('button', {name: 'Next'}));
    expect(onIndexChange).toHaveBeenLastCalledWith(1);

    rerender(
      <Lightbox
        index={2}
        isOpen
        media={media}
        onIndexChange={onIndexChange}
        onOpenChange={() => {}}
      />,
    );

    expect(
      screen.queryByRole('button', {name: 'Next'}),
    ).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', {name: 'Previous'}));
    expect(onIndexChange).toHaveBeenLastCalledWith(1);
  });

  it('supports controlled and uncontrolled gallery indexes', async () => {
    const user = userEvent.setup();
    const onIndexChange = vi.fn();
    const {rerender} = render(
      <Lightbox
        index={0}
        isOpen
        media={media}
        onIndexChange={onIndexChange}
        onOpenChange={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Next'}));

    expect(onIndexChange).toHaveBeenCalledWith(1);
    expect(screen.getByRole('img', {name: 'First image'})).toBeInTheDocument();

    rerender(
      <Lightbox
        defaultIndex={0}
        isOpen
        media={media}
        onOpenChange={() => {}}
      />,
    );

    await user.click(screen.getByRole('button', {name: 'Next'}));
    expect(screen.getByRole('img', {name: 'Second image'})).toBeInTheDocument();
  });

  it('clamps controlled indexes to available media bounds', () => {
    const {rerender} = render(
      <Lightbox
        index={-1}
        isOpen
        media={media}
        onIndexChange={() => {}}
        onOpenChange={() => {}}
      />,
    );

    expect(screen.getByRole('img', {name: 'First image'})).toBeInTheDocument();

    rerender(
      <Lightbox
        index={99}
        isOpen
        media={media}
        onIndexChange={() => {}}
        onOpenChange={() => {}}
      />,
    );

    expect(screen.getByRole('img', {name: 'Third image'})).toBeInTheDocument();
  });

  it('toggles image zoom and does not zoom videos', () => {
    const {rerender} = render(
      <Lightbox hasZoom isOpen media={media[0]} onOpenChange={() => {}} />,
    );

    const image = screen.getByRole('img', {name: 'First image'});
    const viewport = getMediaViewport(image);
    fireEvent.doubleClick(viewport);
    expect(image).toHaveStyle({transform: 'scale(2) translate(0px, 0px)'});

    fireEvent.doubleClick(viewport);
    expect(image).not.toHaveStyle({transform: 'scale(2) translate(0px, 0px)'});

    rerender(<Lightbox hasZoom isOpen media={video} onOpenChange={() => {}} />);

    const videoElement = screen.getByLabelText('Demo video', {
      selector: 'video',
    });
    fireEvent.doubleClick(getMediaViewport(videoElement));
    expect(
      screen.getByLabelText('Demo video', {selector: 'video'}),
    ).toBeInTheDocument();
  });

  it('pans zoomed images and ignores drag gestures at default zoom', () => {
    render(
      <Lightbox hasZoom isOpen media={media[0]} onOpenChange={() => {}} />,
    );

    const image = screen.getByRole('img', {name: 'First image'});
    const viewport = getMediaViewport(image);

    fireEvent.pointerDown(viewport, {clientX: 0, clientY: 0});
    fireEvent.pointerMove(window, {clientX: 20, clientY: 10});
    expect(image).not.toHaveStyle({transform: 'scale(2) translate(10px, 5px)'});

    fireEvent.doubleClick(viewport);
    fireEvent.pointerDown(viewport, {clientX: 0, clientY: 0});
    fireEvent.pointerMove(window, {clientX: 20, clientY: 10});

    expect(image).toHaveStyle({transform: 'scale(2) translate(10px, 5px)'});
  });

  it('resets zoom and pan when navigating', () => {
    render(
      <Lightbox
        defaultIndex={0}
        hasZoom
        isOpen
        media={media}
        onOpenChange={() => {}}
      />,
    );

    const image = screen.getByRole('img', {name: 'First image'});
    const viewport = getMediaViewport(image);
    fireEvent.doubleClick(viewport);
    fireEvent.pointerDown(viewport, {clientX: 0, clientY: 0});
    fireEvent.pointerMove(window, {clientX: 20, clientY: 10});

    expect(image).toHaveStyle({transform: 'scale(2) translate(10px, 5px)'});

    fireEvent.click(screen.getByRole('button', {name: 'Next'}));

    expect(screen.getByRole('img', {name: 'Second image'})).not.toHaveStyle({
      transform: 'scale(2) translate(10px, 5px)',
    });
  });

  it('resets zoom and pan across close and reopen cycles', () => {
    const {rerender} = render(
      <Lightbox hasZoom isOpen media={media[0]} onOpenChange={() => {}} />,
    );

    const image = screen.getByRole('img', {name: 'First image'});
    const viewport = getMediaViewport(image);
    fireEvent.doubleClick(viewport);
    fireEvent.pointerDown(viewport, {clientX: 0, clientY: 0});
    fireEvent.pointerMove(window, {clientX: 20, clientY: 10});

    expect(image).toHaveStyle({transform: 'scale(2) translate(10px, 5px)'});

    rerender(
      <Lightbox
        hasZoom
        isOpen={false}
        media={media[0]}
        onOpenChange={() => {}}
      />,
    );
    rerender(
      <Lightbox hasZoom isOpen media={media[0]} onOpenChange={() => {}} />,
    );

    expect(screen.getByRole('img', {name: 'First image'})).not.toHaveStyle({
      transform: 'scale(2) translate(10px, 5px)',
    });
  });

  it('keeps the dialog label stable while media alt text changes', () => {
    const {rerender} = render(
      <Lightbox index={0} isOpen media={media} onOpenChange={() => {}} />,
    );

    expect(
      screen.getByRole('dialog', {name: 'Media lightbox'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', {name: 'First image'})).toBeInTheDocument();

    rerender(
      <Lightbox index={1} isOpen media={media} onOpenChange={() => {}} />,
    );

    expect(
      screen.getByRole('dialog', {name: 'Media lightbox'}),
    ).toBeInTheDocument();
    expect(screen.getByRole('img', {name: 'Second image'})).toBeInTheDocument();
  });

  it('hides gallery controls for single media and renders gallery counter for multiple media', () => {
    const {rerender} = render(
      <Lightbox isOpen media={media[0]} onOpenChange={() => {}} />,
    );

    expect(
      screen.queryByRole('button', {name: 'Previous'}),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole('button', {name: 'Next'}),
    ).not.toBeInTheDocument();
    expect(screen.queryByText('1 / 3')).not.toBeInTheDocument();

    rerender(<Lightbox isOpen media={media} onOpenChange={() => {}} />);

    expect(screen.getByRole('button', {name: 'Next'})).toBeInTheDocument();
    expect(screen.getByText('1 / 3')).toBeInTheDocument();
  });

  it('preloads adjacent image slides in a gallery', () => {
    const preloadedSources: string[] = [];
    class MockImage {
      set src(value: string) {
        preloadedSources.push(value);
      }
    }
    vi.stubGlobal('Image', MockImage);

    const {rerender} = render(
      <Lightbox
        index={1}
        isOpen
        media={[media[0], media[1], video]}
        onOpenChange={() => {}}
      />,
    );

    expect(preloadedSources).toEqual(['/first.jpg']);

    rerender(
      <Lightbox index={1} isOpen media={media} onOpenChange={() => {}} />,
    );

    expect(preloadedSources).toEqual([
      '/first.jpg',
      '/first.jpg',
      '/third.jpg',
    ]);
  });

  it('renders video controls and autoplay', () => {
    render(
      <Lightbox hasAutoPlay isOpen media={video} onOpenChange={() => {}} />,
    );

    const videoElement = screen.getByLabelText('Demo video', {
      selector: 'video',
    });
    expect(videoElement.tagName).toBe('VIDEO');
    expect(videoElement).toHaveAttribute('controls');
    expect(videoElement).toHaveAttribute('autoplay');
    // eslint-disable-next-line testing-library/no-node-access -- verifying the media track child attributes
    expect(videoElement.querySelector('track')).toHaveAttribute(
      'src',
      '/captions.vtt',
    );
  });

  it('forwards ref, className, style, and data-testid to the dialog', () => {
    const ref = vi.fn();

    render(
      <Lightbox
        className="custom-lightbox"
        data-testid="lightbox"
        isOpen
        media={media[0]}
        onOpenChange={() => {}}
        ref={ref}
        style={{color: 'red'}}
      />,
    );

    const dialog = screen.getByTestId('lightbox');
    expect(dialog).toBe(screen.getByRole('dialog', {name: 'Media lightbox'}));
    expect(dialog).toHaveClass('custom-lightbox');
    expect(dialog).toHaveStyle({color: 'rgb(255, 0, 0)'});
    expect(ref).toHaveBeenCalledWith(dialog);
  });

  it('does not crash for an empty media array', () => {
    render(<Lightbox isOpen media={[]} onOpenChange={() => {}} />);

    expect(
      screen.getByRole('dialog', {name: 'Media lightbox'}),
    ).toBeInTheDocument();
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText('Demo video', {selector: 'video'}),
    ).not.toBeInTheDocument();
  });
});

describe('useLightbox', () => {
  it('opens, closes, and exposes trigger props for a single item', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const lightbox = useLightbox({media: media[0]});
      return (
        <>
          <Button label="Open imperative" onClick={() => lightbox.open()} />
          <Button label="Close imperative" onClick={lightbox.close} />
          <span data-testid="state">{lightbox.isOpen ? 'open' : 'closed'}</span>
          <span data-testid="index">{lightbox.index}</span>
          <div data-testid="trigger" {...lightbox.triggerProps}>
            Thumbnail
          </div>
          {lightbox.element}
        </>
      );
    }

    render(<Fixture />);

    expect(screen.getByTestId('state')).toHaveTextContent('closed');
    expect(screen.getByTestId('trigger')).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
    await user.click(screen.getByTestId('trigger'));
    expect(screen.getByTestId('state')).toHaveTextContent('open');
    expect(screen.getByTestId('index')).toHaveTextContent('0');

    await user.click(screen.getByRole('button', {name: 'Close imperative'}));
    expect(screen.getByTestId('state')).toHaveTextContent('closed');

    screen.getByTestId('trigger').focus();
    await user.keyboard('{Enter}');
    expect(screen.getByTestId('state')).toHaveTextContent('open');
  });

  it('opens a gallery at a specific index with getTriggerProps', async () => {
    const user = userEvent.setup();

    function Fixture(): React.JSX.Element {
      const lightbox = useLightbox({media});
      return (
        <>
          <div data-testid="third-trigger" {...lightbox.getTriggerProps(2)}>
            Third
          </div>
          <span data-testid="index">{lightbox.index}</span>
          {lightbox.element}
        </>
      );
    }

    render(<Fixture />);

    await user.click(screen.getByTestId('third-trigger'));

    expect(screen.getByTestId('third-trigger')).toHaveAttribute(
      'aria-haspopup',
      'dialog',
    );
    expect(screen.getByTestId('index')).toHaveTextContent('2');
    expect(screen.getByRole('img', {name: 'Third image'})).toBeInTheDocument();
  });
});

/* eslint-disable silver-ui/require-component-props -- internal presentational connector */

import {treeViewBranchesRecipe} from './TreeViewBranches.recipe';

const styles = treeViewBranchesRecipe();

const branchOffset = '6px';

interface TreeViewBranchesProps {
  /**
   * Whether each ancestor at the corresponding level is the last sibling.
   */
  ancestorsIsLast: ReadonlyArray<boolean>;
  /**
   * Zero-based nesting depth used to draw vertical connector lines.
   */
  nestedLevel: number;
}

/**
 * Renders vertical connector lines for tree item indentation levels.
 */
export function TreeViewBranches({
  ancestorsIsLast,
  nestedLevel,
}: TreeViewBranchesProps): React.JSX.Element {
  return (
    <>
      {ancestorsIsLast.map((ancestorIsLast, level) => {
        if (ancestorIsLast || level === nestedLevel - 1) {
          return null;
        }

        return (
          <div
            className={styles.container}
            // eslint-disable-next-line @eslint-react/no-array-index-key -- level is the stable connector coordinate
            key={level}
            style={{left: `calc(${branchOffset} + ${level} * 16px)`}}>
            <div className={styles.line} />
          </div>
        );
      })}
      {nestedLevel > 0 ? (
        <div
          className={styles.container}
          style={{left: `calc(${branchOffset} + ${nestedLevel - 1} * 16px)`}}>
          <div className={styles.line} />
        </div>
      ) : null}
    </>
  );
}

TreeViewBranches.displayName = 'TreeViewBranches';

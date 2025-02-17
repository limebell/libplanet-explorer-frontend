import React from 'react';
import { css } from 'emotion';
import { navigate } from 'gatsby';
import { DefaultButton, Link } from 'office-ui-fabric-react';
import {
  DetailsList,
  DetailsListLayoutMode,
  SelectionMode,
  IColumn,
} from 'office-ui-fabric-react/lib/DetailsList';
import { Block, BlockListComponent } from '../generated/graphql';
import useSearchParams from '../misc/useSearchParams';

interface IndexPageProps {
  location: Location;
}

const IndexPage: React.FC<IndexPageProps> = ({ location }) => {
  const limit = 20;
  const [searchParams, setSearchParams] = useSearchParams(location);
  const { offset = 0 } = searchParams;
  const setOffset = (offset: number) => {
    if (offset < 1) {
      const newSearchParams = { ...searchParams };
      delete newSearchParams.offset;
      setSearchParams(newSearchParams);
    } else {
      setSearchParams({ ...searchParams, offset });
    }
  };
  const olderHandler = () => {
    setOffset(+offset + limit);
  };
  const newerHandler = () => {
    setOffset(+offset - limit);
  };

  return (
    <>
      <BlockListComponent variables={{ offset, limit }}>
        {({ data, loading, error }) => {
          if (error) return <p>error!</p>;

          const timestamps: Date[] | null = data && data.blocks
            ? data.blocks.map(block => new Date(block!.timestamp))
            : null;

          let interval : number | null = timestamps ? 0 : null;
          if (interval != null && timestamps) {
            for (let i = 0; i < timestamps.length - 1; i++) {
              interval += +timestamps[i] - +timestamps[i + 1];
            }
            interval /= (timestamps.length - 1) * 1000;
          }

          const difficulties: number[] | null = data && data.blocks
            ? data.blocks.map(block => block!.difficulty)
            : null;
          let difficulty = 0;
          if (difficulty != null && difficulties) {
            difficulty = difficulties.reduce((d, sum) => d + sum, 0)
              / difficulties.length;
          }
          return (
            <>
              <p key="interval">Recent {limit} blocks' interval: {interval} sec</p>
              <p key="difficulty">Recent {limit} blocks' difficulty: {difficulty}</p>
              <DefaultButton
                onClick={newerHandler}
                disabled={loading || offset < 1}
                className={css`
                  margin-right: 5px;
                `}>
                &larr; Newer
              </DefaultButton>
              <DefaultButton disabled={loading} onClick={olderHandler}>
                Older &rarr;
              </DefaultButton>
              {loading ? (
                <p>Loading&hellip;</p>
              ) : (
                <BlockList
                  blocks={loading ? [] : (data!.blocks as NonNullable<Block[]>)}
                />
              )}
            </>
          );
        }}
      </BlockListComponent>
    </>
  );
};

interface BlockListProps {
  blocks: Pick<Block, 'hash' | 'index'>[];
}

const BlockList: React.FC<BlockListProps> = ({ blocks }) => {
  const columns: IColumn[] = [
    {
      key: 'columnIndex',
      name: 'Index',
      fieldName: 'index',
      iconName: 'NumberSymbol',
      isIconOnly: true,
      minWidth: 5,
      maxWidth: 40,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: true,
      data: 'number',
      isPadded: true,
    },
    {
      key: 'columnHash',
      name: 'Hash',
      fieldName: 'hash',
      minWidth: 350,
      maxWidth: 450,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: false,
      data: 'string',
      isPadded: true,
      onRender: block => (
        <Link href={`./block/?${block.hash}`}>{block.hash}</Link>
      ),
    },
    {
      key: 'columnTimestamp',
      name: 'Timestamp',
      fieldName: 'timestamp',
      minWidth: 100,
      maxWidth: 200,
      isRowHeader: true,
      isResizable: true,
      isSorted: false,
      isSortedDescending: true,
      data: 'string',
      isPadded: true,
    },
  ];
  return (
    <DetailsList
      items={blocks}
      columns={columns}
      selectionMode={SelectionMode.none}
      getKey={block => block.hash}
      setKey="set"
      layoutMode={DetailsListLayoutMode.justified}
      isHeaderVisible={true}
      onItemInvoked={block => navigate(`/block/?${block.hash}`)}
    />
  );
};

export default IndexPage;

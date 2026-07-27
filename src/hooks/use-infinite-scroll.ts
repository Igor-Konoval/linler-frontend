import {
  useEffect,
  useRef,
  useState,
  type RefCallback,
  type RefObject,
} from 'react';

type UseInfiniteScrollOptions = {
  enabled?: boolean;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  rootRef?: RefObject<Element | null>;
  rootMargin?: string;
  threshold?: number;
  onLoadMore: () => Promise<unknown> | unknown;
};

export function useInfiniteScroll({
  enabled = true,
  hasNextPage,
  isFetchingNextPage,
  rootRef,
  rootMargin = '0px 0px 80px 0px',
  threshold = 0,
  onLoadMore,
}: UseInfiniteScrollOptions): { loadMoreRef: RefCallback<Element> } {
  const [loadMoreElement, setLoadMoreElement] = useState<Element | null>(null);
  const onLoadMoreRef = useRef(onLoadMore);

  useEffect(() => {
    onLoadMoreRef.current = onLoadMore;
  }, [onLoadMore]);

  useEffect(() => {
    if (!enabled || !hasNextPage || !loadMoreElement) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
          void onLoadMoreRef.current();
        }
      },
      {
        root: rootRef?.current ?? null,
        rootMargin,
        threshold,
      },
    );

    observer.observe(loadMoreElement);

    return () => {
      observer.disconnect();
    };
  }, [
    enabled,
    hasNextPage,
    isFetchingNextPage,
    loadMoreElement,
    rootMargin,
    rootRef,
    threshold,
  ]);

  return { loadMoreRef: setLoadMoreElement };
}

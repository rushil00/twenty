import { useLocation } from 'react-router-dom';
import { useIcons } from 'twenty-ui';

import { ObjectMetadataNavItemsSkeletonLoader } from '@/object-metadata/components/ObjectMetadataNavItemsSkeletonLoader';
import { useFilteredObjectMetadataItems } from '@/object-metadata/hooks/useFilteredObjectMetadataItems';
import { useIsPrefetchLoading } from '@/prefetch/hooks/useIsPrefetchLoading';
import { usePrefetchedData } from '@/prefetch/hooks/usePrefetchedData';
import { PrefetchKey } from '@/prefetch/types/PrefetchKey';
import { NavigationDrawerItem } from '@/ui/navigation/navigation-drawer/components/NavigationDrawerItem';
import { View } from '@/views/types/View';
import { getObjectMetadataItemViews } from '@/views/utils/getObjectMetadataItemViews';

export const ObjectMetadataNavItems = () => {
  const { activeObjectMetadataItems } = useFilteredObjectMetadataItems();
  const { getIcon } = useIcons();
  const currentPath = useLocation().pathname;

  const { records: views } = usePrefetchedData<View>(PrefetchKey.AllViews);
  const loading = useIsPrefetchLoading();

  if (loading) {
    return <ObjectMetadataNavItemsSkeletonLoader />;
  }

  return (
    <>
      {[
        ...activeObjectMetadataItems
          .filter((item) =>
            ['person', 'company', 'opportunity'].includes(item.nameSingular),
          )
          .sort((objectMetadataItemA, objectMetadataItemB) => {
            const order = ['person', 'company', 'opportunity'];
            const indexA = order.indexOf(objectMetadataItemA.nameSingular);
            const indexB = order.indexOf(objectMetadataItemB.nameSingular);
            if (indexA === -1 || indexB === -1) {
              return objectMetadataItemA.nameSingular.localeCompare(
                objectMetadataItemB.nameSingular,
              );
            }
            return indexA - indexB;
          }),
        ...activeObjectMetadataItems
          .filter(
            (item) =>
              !['person', 'company', 'opportunity'].includes(item.nameSingular),
          )
          .sort((objectMetadataItemA, objectMetadataItemB) => {
            return new Date(objectMetadataItemA.createdAt) <
              new Date(objectMetadataItemB.createdAt)
              ? 1
              : -1;
          }),
      ].map((objectMetadataItem) => {
        const objectMetadataViews = getObjectMetadataItemViews(
          objectMetadataItem.id,
          views,
        );
        const viewId = objectMetadataViews[0]?.id;

        const navigationPath = `/objects/${objectMetadataItem.namePlural}${
          viewId ? `?view=${viewId}` : ''
        }`;

        return (
          <NavigationDrawerItem
            key={objectMetadataItem.id}
            label={objectMetadataItem.labelPlural}
            to={navigationPath}
            active={currentPath === `/objects/${objectMetadataItem.namePlural}`}
            Icon={getIcon(objectMetadataItem.icon)}
          />
        );
      })}
    </>
  );
};

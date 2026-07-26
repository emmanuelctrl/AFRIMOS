import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useProductPhoto } from '@/hooks/useProductPhoto';
import { CommodityArt, slugify } from './CommodityArt';

/**
 * The picture of a commodity: a photograph from `public/products/` when one
 * has been added, and the drawn art otherwise. Both fill their container, so
 * a card looks the same shape either way.
 */
export function ProductImage({ name, className }: { name: string; className?: string }) {
  const photo = useProductPhoto(slugify(name));

  return (
    <div className={cn('relative overflow-hidden', className)}>
      <CommodityArt name={name} className="h-full w-full" />

      {photo && (
        <motion.img
          src={photo}
          alt=""
          decoding="async"
          loading="lazy"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0 h-full w-full object-cover"
        />
      )}
    </div>
  );
}

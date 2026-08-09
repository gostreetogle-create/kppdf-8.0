import { photoListUrl, type Photo } from './photos.service';

describe('photoListUrl', () => {
  const original: Photo = {
    _id: 'original-id',
    storageUrl: '/uploads/original.png',
    variant: 'original',
  };
  const thumb: Photo = {
    _id: 'thumb-id',
    storageUrl: '/uploads/thumb.webp',
    variant: 'thumb',
    parentPhotoId: 'original-id',
  };

  it('uses a thumb photo directly', () => {
    expect(photoListUrl(thumb)).toBe('/uploads/thumb.webp');
  });

  it('resolves a linked thumb for an original photo', () => {
    expect(photoListUrl(original, [original, thumb])).toBe('/uploads/thumb.webp');
  });

  it('resolves a linked thumb when the relation is stored on the thumb', () => {
    const reverseLinkedThumb: Photo = {
      _id: 'reverse-thumb-id',
      storageUrl: '/uploads/reverse-thumb.webp',
      variant: 'thumb',
      linkedPhotoId: 'original-id',
    };
    expect(photoListUrl(original, [original, reverseLinkedThumb])).toBe(
      '/uploads/reverse-thumb.webp',
    );
  });

  it('falls back to the original URL for legacy photo data', () => {
    expect(photoListUrl(original)).toBe('/uploads/original.png');
  });
});

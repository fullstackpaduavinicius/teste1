// src/meta/PageMeta.tsx
export function PageMeta({
  title,
  description,
  image,
  url,
}: { title: string; description?: string; image?: string; url?: string }) {
  return (
    <>
      <title>{title}</title>
      {description && <meta name="description" content={description} />}

      {/* Open Graph / WhatsApp / Facebook */}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {image && <meta property="og:image" content={image} />}
      {url && <meta property="og:url" content={url} />}
      <meta property="og:type" content="website" />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}
    </>
  );
}

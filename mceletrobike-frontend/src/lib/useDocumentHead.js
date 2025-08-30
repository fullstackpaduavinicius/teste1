import { useEffect } from 'react';

export function useDocumentHead({ title, description, image, url }) {
  useEffect(() => {
    if (title) document.title = title;

    const ensure = (name, attr='name') => {
      let el = document.querySelector(`meta[${attr}="${name}"]`);
      if (!el) { el = document.createElement('meta'); el.setAttribute(attr, name); document.head.appendChild(el); }
      return el;
    };

    if (description) ensure('description').setAttribute('content', description);
    if (title)      ensure('og:title', 'property').setAttribute('content', title);
    if (description)ensure('og:description','property').setAttribute('content', description);
    if (image)      ensure('og:image', 'property').setAttribute('content', image);
    if (url)        ensure('og:url', 'property').setAttribute('content', url);
  }, [title, description, image, url]);
}

// utils.js
export const copyToClipboard = (url) => {
  navigator.clipboard.writeText(url);
//   setTimeout(() => setCopied(false), 2000); //todo
};

export const shareOnSocial = (platform, url, title) => {
  let shareUrl = '';
  switch (platform) {
    case 'twitter':
      shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url.url)}&text=${encodeURIComponent(url.title)}`;
      break;
    case 'facebook':
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url.url)}`;
      break;
    case 'linkedin':
      shareUrl = `https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(url.url)}&title=${encodeURIComponent(url.title)}`;
      break;
    default:
      return;
  }
  window.open(shareUrl, '_blank', 'noopener,noreferrer');
};

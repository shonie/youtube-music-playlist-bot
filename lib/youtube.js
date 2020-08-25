const YOUTUBE_LINK_REGEXP = /^(http(s)?:\/\/)?((w){3}.)?(music\.)?youtu(be|.be)?(\.com)?\/.+/gm;

export function isYoutubeLink(link) {
  return link.test(YOUTUBE_LINK_REGEXP);
}

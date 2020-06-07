chrome.tabs.query(
  { active: true, windowId: chrome.windows.WINDOW_ID_CURRENT },
  function(tabs) {
    const id = tabs[0].id;

    const code = `document.body.innerHTML`;

    // http://infoheap.com/chrome-extension-tutorial-access-dom/
    chrome.tabs.executeScript(id, { code }, function(result) {
      // result has the return value from `code`

      const links = getLinksFromString(result[0]);
      const urls = getIdsFromLinksAndCreatePlaylist(links);

      if (urls != null) {
        const playListUrl = urls[0];
        const embedUrl = urls[1];

        const youtubeLinkElement = document.getElementById(
          'youtube-playlist-link'
        );

        const youtubeEmbedElement = document.getElementById('youtube-embed');

        youtubeLinkElement.innerHTML =
          "<a href='" + playListUrl + "' target='_blank'>LINK to playlist</a>";

        youtubeEmbedElement.innerHTML =
          '<iframe id="ytplayer" type="text/html" width="640" height="360" src="' +
          embedUrl +
          '" frameborder="0"></iframe>';
      }
    });
  }
);

function getLinksFromString(string) {
  const regexPattern = new RegExp(
    '(?<=")(https?://)?(www.)?(youtube.com|youtu.?be)/.+?(?=")',
    'g'
  );
  const links = string.match(regexPattern);
  return links;
}

function getIdsFromLinksAndCreatePlaylist(links) {
  let idList = [];

  if (links != null) {
    for (var i = 0; i < links.length; i++) {
      idList.push(getIdFromString(links[i]));
    }
  }

  if (idList.length === 0) {
    return null;
  }

  let playListUrl = 'https://www.youtube.com/watch_videos?video_ids=';

  let embedUrl = 'https://www.youtube.com/embed/';
  let idString = '';
  let videoId = '';
  const idSet = [...new Set(idList)];

  for (var i = 0; i < idSet.length; i++) {
    if (i === 0) {
      videoId += idSet[i];
    } else if (i === 1) {
      videoId += ',' + idSet[i];
      idString += ',';
    } else {
      idString += ',' + idSet[i];
    }
  }

  playListUrl += videoId + ',' + idString;
  embedUrl += videoId + '?playlist=' + idString;
  return [playListUrl, embedUrl];
}

function getIdFromString(string) {
  const regexPattern = new RegExp(
    '^.*(youtu.be/|v/|e/|u/w+/|embed/|v=)([^#&?]*).*',
    'g'
  );
  const videoIds = getMatches(string, regexPattern, 2);

  if (videoIds != null) {
    return videoIds[0];
  }

  return null;
}

function getMatches(string, regex, index) {
  index || (index = 2); // default to the first capturing group
  var matches = [];
  var match;
  while ((match = regex.exec(string))) {
    matches.push(match[index]);
  }
  return matches;
}

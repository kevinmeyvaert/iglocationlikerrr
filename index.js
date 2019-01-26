require('dotenv').load();

const InstagramV1 = require('instagram-private-api').V1;
const Promise = require('bluebird');

async function getPostsByLocationAndLike () {
    const device = new InstagramV1.Device('smmtooltest')
    const storage = new InstagramV1.CookieFileStorage(`${__dirname}/cookies/${process.env.IG_USERNAME}.json`);
    const session = await InstagramV1.Session.create(device, storage, process.env.IG_USERNAME, process.env.IG_PASSWORD);
    const feed = new InstagramV1.Feed.LocationMedia(session, process.env.LOCATION, process.env.LIMIT);

    feed.map = item => ({
      postId: item._params.id,
      weblink: item._params.webLink,
      caption: item._params.caption,
      user:  item._params.user.username,
      userId: item._params.user.pk,
    });

    feed.on('data', (chunk) => console.log('Processed chunk.'));
    feed.on('end', (allResults) => {
      console.log(allResults);
      console.log(`${allResults.length} results are output above.`);
      console.log(`Now starting the likes.`)
      allResults.map(result => {
        try {
          const like = new InstagramV1.Like.create(session, result.postId);
          like.then(() => console.log(`Liked ${result.user}'s post!`));
        } catch(error) {
          console.error('Oopsie! Something went wrong with following error message: ', error);
        }
      })
    });
    const allResults = await feed.all();
    return allResults;
}
getPostsByLocationAndLike()
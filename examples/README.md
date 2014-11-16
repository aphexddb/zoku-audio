## Here Be Examples

### [twitter.js](twitter.js)

This file:

* Gets mood from `TwitterMood`
* Maps the mood to a `-1.0` to `1.0` range
* Generates various waves using an [oscillator](https://github.com/NHQ/oscillators)
* Emits audio to your left/right speakers

You will need a Twitter app created for tokens and secrets. Create [one here](https://apps.twitter.com/app/7213267/keys). Then use those values in these environment variables as well:

* TWITTER_CONSUMER_KEY
* TWITTER_CONSUMER_SECRET
* TWITTER_ACCESS_TOKEN
* TWITTER_ACCESS_TOKEN_SECRET

Example:

    TWITTER_CONSUMER_KEY="xxx" TWITTER_CONSUMER_SECRET="xxx" TWITTER_ACCESS_TOKEN="xxx" TWITTER_ACCESS_TOKEN_SECRET="xxx" node twitter.js

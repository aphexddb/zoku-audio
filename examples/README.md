## Here Be Examples

### [twitter_mood](Twitter Mood)

Open the puredata patch `twitter_mood/puredata/mood_fancy.pd` to hear audio

* Gets mood from Twitter
* Maps the mood to a `0` to `127` range
* Emits mood over OSC (via UDP)
* Provides a UI to see twitter messages and mood, as well as change filters

You will need a Twitter app created for tokens and secrets. Create [one here](https://apps.twitter.com/app/7213267/keys). Then use those values in these environment variables as well:

* TWITTER_CONSUMER_KEY
* TWITTER_CONSUMER_SECRET
* TWITTER_ACCESS_TOKEN
* TWITTER_ACCESS_TOKEN_SECRET

To run:

    npm install
    TWITTER_CONSUMER_KEY="xxx" TWITTER_CONSUMER_SECRET="xxx" TWITTER_ACCESS_TOKEN="xxx" TWITTER_ACCESS_TOKEN_SECRET="xxx" npm start

Then open your browser to [http://127.0.0.1:8080](http://127.0.0.1:8080)

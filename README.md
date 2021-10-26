# KusaGames
A base website suite for gaming match database.\
Designed for 1v1 matches, but you could fork and amend it for any competition.

## How to run

0. Need to install Node.js: https://nodejs.org/en/download/
1. Download the source code.
2. Run `npm install` to pull dependencies.
3. Copy `config.example.js` and rename the copy to `config.js`.
4. Adjust `config.js` to your liking.
5. Run `node index.js` to start. 
6. Alternatively you can also run using pm2 via `pm2 start ecosystem.config.js`. (You will need to have pm2 installed)

## Adding your own game

It's fairly simple.
1. Change `server/charIdMap.js` and add your characters.
    1. `id` **must** match the object's id.\
        Try using short ids to reduce match datafile size.
    1. `name` is commonly known name for the character.\
        This name shows up in the select boxes when searching and in the editor selects too.
    1. `full` is full name of the character.\
        Full name shows up in the characters page. Can be empty.
    1. `wiki` is a link to a place where people can read on the character. Like a guide or something.

For example:
```
"arc": {
	"id": "arc",
	"name": "Arcueid",
	"full": "Arcueid Brunestud",
	"wiki": "https://wiki.gbl.gg/w/Melty_Blood/MBTL/Arcueid_Brunestud"
}

```
2. Add your character images to `site\img\chars`. 
    1. Directly in the folder there should be each image with `{{character id}}.png`.
        1. These are 80x100 images used in the search result list and editor match list.
    1. In `site\img\chars\big` full sized character images should be added. 
        1. They show up as background in the characters page. Name should match the id.
3. Create logos for each character in site\img\logos.
    1. Logos are 220x56 images. Each character should have their logo.\
        Server randomly shows them each refresh.
    1. Name is important: `logo_{{character id}}.png`.
4. Clean contents of `data\match.data`. These are not for your game (Don't delete the file though).

And thats it. You can run this, and it shouldn't break. If problems, check FAQ in the website on how to contact Eika.\
However, at this point you will not have any matches yet of your game.

## Adding matches
Anyone can add matches. However, these matches will be added as provisional.\
Meaning they will not show up in the search, until they are approved by the trusted people with token.

You can add a token by modifying `config.js`. In the config.js,  there is an `contributors` array.\
In the array each object is a contributor that can have a token.\
You can see in the example Eika has token `eikaaa`.\
This means that contributor, once they enter this token in the Editor page, will be able to add matches.\
And these matches will not need an approval.\
Further to this, that contributor does not have noApprove flag. This means that Eika is one of the contributors that can also approve provisional matches.\
Some contributors might not have a token, they are there to be seen in Contributors page.\
These could be, for example, people who helped with the hosting of the website, or patreon supporters.

Now that you know your token, head over to Editor page in the website.\
**Read the information in the Editor page!** \
Again. **Read the information in the Editor page!**

Now you know how to add matches using the editor!

Try adding them without a token (you can update it to some invalid token instead of removing a token cookie).\
Once you add provisional videos, set valid token back and note the `Check and maybe approve some provisional videos?` link.\
This link doesn't appear if `noApprove` flag is set on the contributor.\
Click on the link and you will see the provisional video you added.\
You will then be able to approve it or delete it.

## Logging

There is some logging going on when matches are added/edited/deleted.\
Log file can be found in `data\log-{{DATE}}.data`. This will automatically create a new log file each month of the year.

There are also report file in `data\reports.data`.\
These are info from users on incorrect matches. What if wrong winner was set, or some character is wrong. Stuff like that.\
Useful to peek and fix some matches once in a while.

## Backend structure

Just an express website.\
Underscore.js is used for page templating.

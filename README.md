# UnextKalturaPlayerAnalytic

This project is created to resolve the analytics bug faced while embedding the Kaltura player

### Problem
When we view an entry from a playerId / uiConfId which has statistics disabled, the player analytics are recorded.


### Steps to Reproduce the issue
1. Clone this Repo
2. npm install
3. Create two players on KMC - One with Statistics enabled, One without statistics enabled.
4. Update the configuration in `src/app/config.ts`
5. npm start
6. Click on "View anlytics for Video" CTA - Note down the play count + player impressions count
7. Click on "Play Video without Analytics"
8. Play the video
9. Check the analytics again
10. The play count and player impression will be incremented.




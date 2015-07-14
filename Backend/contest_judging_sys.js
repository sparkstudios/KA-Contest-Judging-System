/***
 * This file is where all the general purpose, reusable code should go!
***/
window.Contest_Judging_System = (function() {
	/* jQuery and Firebase are both dependencies for this project. If we don't have them, exit the function immediately. */
	if (!window.jQuery || !window.Firebase || !window.KA_API) return; // TODO: If a project dependency doesn't exist, go ahead an inject it.

	return {
		include: function(path) {
            /* Puts <script> with src of path into <body> and returns the <script> element */
            var scriptTag = document.createElement("script");
            scriptTag.src = path;
            document.body.appendChild(scriptTag);
            return scriptTag;
        },
		getStoredContests: function(callback) {
            /* This function gets the stored contests within our Firebase database and passes them into callback. */
            //This is the object for the contests within our Firebase database.
			var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/contests/");
            //These are the stored contests we will pass into callback
			var fromFirebase = {};
            //Insert all of the entries in our database in order by key
			fbRef.orderByKey().on("child_added", function(item) {
				fromFirebase[item.key()] = item.key();
			});
            //Finally, pass fromFirebase into callback.
			fbRef.once("value", function(data) {
				callback(fromFirebase);
			});
		},
		sync: function(callback) {
			/*
			 * sync() just fetches the latest data from Khan Academy and Firebase, and compares it.
			 * We have two arrays of data; kaData and fbData. We get the data using the KA_API and the above getStoredContests() method.
			 * Once both requests have finished, we set fbData to kaData using the Firebase set() method.
			 * Originally authored by Gigabyte Giant
			 * TODO: Perform added/deleted checking on contest entries.
             * TODO: Actually do something with callback
             * TODO: Actually do something with fbData
			 */
            //These two Booleans check whether or not both requests have been completed.
			var completed = {
				firebase: false,
				khanacademy: false
			};
			/* Currently not used. Might be re-implemented in the future. */
			//var addedContests = [];
			//var removedContests = [];
            //Our two arrays of data
			var kaData;
			var fbData;

            //Get all of the contests and contest entries using KA_API.
			KA_API.getContests(function(response) {
                /* When done, set kaData to the contests and set completed.khanacademy to true. */
				kaData = response;
				completed.khanacademy = true;
			});
            //Get all of the contests in our database using the above getStoredContests() method.
			this.getStoredContests(function(response) {
                /* When done, set fbData to our stored contests and set completed.firebase to true. */
				fbData = response;
				completed.firebase = true;
			});

            //This is the object for the contests within our Firebase database.
			var fbRef = new Firebase("https://contest-judging-sys.firebaseio.com/contests/");
            //Every second, we check if both requests have been completed and if they have, we stop checking if both requests have been completed and set fbRef to kaData using the Firebase set() method.
			var recievedData = setInterval(function() {
				if (completed.firebase && completed.khanacademy) {
					clearInterval(recievedData);
					fbRef.set(kaData);
				}
			}, 1000);
		}
	};
})();

import { inbox } from "file-transfer";
import { settingsStorage } from "settings";

const urlFirebase = "Firebase Storage URL";
var userEncodedId;

// Process the inbox queue for files, and read their contents as text
async function processAllFiles() {
   let file;
   while ((file = await inbox.pop())) {
     console.log(`New file: ${file.name}`);
     let payload = await file.cbor();
     // console.log(`file contents: ${JSON.stringify(payload)}`);
     
     while(!userEncodedId) // wait to get encodedId
        await new Promise(resolve => setTimeout(resolve, 1000)); // wait 1s
     
     fetch(urlFirebase + userEncodedId + "%2F" + file.name, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      })
      .then(function(response) {
        return response.json();}) //Extract JSON from the response
      .then(function(data) {
        console.log("Got response from server:", JSON.stringify(data)); }) // Log ig
      .catch(function(error) {
        console.log(error);}); // Log any errors with Fetch
     console.log(`Sent request to ${urlFirebase}${userEncodedId}%2F${file.name}`);
   }
}

// A user changes Settings
settingsStorage.onchange = evt => {
  console.log("User changes Settings");
  if (evt.key === "oauth") {
    // Settings page sent us an oAuth token from which we can take the encoded ID
    let data = JSON.parse(evt.newValue);
    console.log("Get user_id from changed settings");
    userEncodedId = data.user_id;
  }
};

// Restore previously saved user_id
function restoreUserEncodedId() {
  for (let index = 0; index < settingsStorage.length; index++) {
    let key = settingsStorage.key(index);
    if (key && key === "oauth") {
      // We already have an oauth token from which we can take the encoded ID
      let data = JSON.parse(settingsStorage.getItem(key));
      console.log("Get user_id from an old oauth");
      userEncodedId = data.user_id;
    }
  }
}

if(!userEncodedId)
  restoreUserEncodedId();

// Process new files as they are received
inbox.addEventListener("newfile", processAllFiles);

// Also process any files that arrived when the companion wasn’t running
processAllFiles();

# AR Creator API

This is an api that allows for creation of AR Experiences using .patt and .gltf files.

## Usage

`npm install` - Install dependencies

`node app.js` - Run the server at https://localhost:8080

## API

---

### `/api/createexperience`

Receives a POST request of multipart/form-data, in this format:

`name` : String name of the experience. Also becomes the path of the experience.

All others are .gltf and .patt files, names should be formatted as such:

`${file type}_${index}` : Where 'file type' is either 'model' or 'patt', and 'index' is the index that associates the .gltf and .patt files.

For example, the two files uploaded under names `model_1` and `patt_1` will be linked together such that `patt_1` markers will show the model in `model_1`.

---

### `/api/experiences/:name`

Requests the experience with the URL formatted name.
Returns and array of asset objects, each with the name of the .patt file and .gltf file for use with AR.js
These file names are relative to the request URL, so can be requested by going to `/api/experiences/:name/${file name}`

---

## App

If you don't want to use the API yourself, a pre-built app is bundled, at the `/app` endpoint.

---

### `/app`

Returns a form where you can create an experience by uploading .patt and .gltf files

---

### `/app/experiences/:name`

Returns an AR.js experience using the models and .patt files uploaded.
Will show the models when the markers appear in the camera.

---
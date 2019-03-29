const config = {
    apiKey: process.env.GATSBY_FIREBASE_WEB_API_KEY,
    authDomain: process.env.GATSBY_FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.GATSBY_FIREBASE_DATABASE_URL,
    projectId: process.env.GATSBY_FIREBASE_PROJECT_ID,
};

let firebaseInstance

export const getFirebase = (firebase, UID) => {
    if (firebaseInstance) {
        return firebaseInstance
    }

    firebase.initializeApp(config)
    firebase.auth().signInWithCustomToken(UID).catch(function (error) {
        console.warn(error.message);
    });

    firebaseInstance = firebase

    return firebase
}

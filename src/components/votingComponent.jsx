import { useState } from "react";
import PropTypes from "prop-types";

import firebase from "firebase/app";
import "firebase/database"; // Import only 'firebase/firestore' if you're using Firestore

// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
//import { getAnalytics } from "firebase/analytics";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAJvvgffjS_U3B1iBgohQQz75TbunlH0YM",
  authDomain: "elecc19nes.firebaseapp.com",
  projectId: "elecc19nes",
  storageBucket: "elecc19nes.appspot.com",
  messagingSenderId: "503535169141",
  appId: "1:503535169141:web:6eed0a38923cab882ed23c",
  measurementId: "G-WY43PJVF39",
};

const database = firebase.database();

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

function VotingComponent({ voter }) {
  const [votos, setVotos] = useState(voter.votes);

  function plusOne() {
    const votantesRef = database.ref("votantes").child(voter.id); // Assuming each voter has a unique ID

    // Update the vote count in the database
    votantesRef.update({
      votes: votos + 1,
    });

    // Update the vote count in the local state for immediate UI update
    setVotos(votos + 1);
  }

  return (
    <div>
      <button onClick={plusOne}>Vote</button>
      <p>
        {voter.name}, {votos} votes.
      </p>
    </div>
  );
}

export default VotingComponent;

VotingComponent.defaultProps = {
  voter: {},
};
VotingComponent.propTypes = {
  voter: PropTypes.object,
};

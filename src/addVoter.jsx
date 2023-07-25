import { useState } from "react";
import { collection, addDoc } from 'firebase/firestore';
import db from './firebase'; // Make sure to import the Firestore instance (db) correctly


export const AddVoter = ( ) => {

  // ESTADO PARA AGREGAR VOTANTES
  const [newCandidate, setNewCandidate] = useState('')

  function handleInputChange(event) {
    setNewCandidate(event.target.value);
  }


  function addNewCandidate(event) {
    event.preventDefault();
    if (newCandidate.trim() !== '') {
        // Add the new candidate to Firestore
        addDoc(collection(db, 'votantes'), {
        name: newCandidate,
        votes: 0, // Initial votes set to 0
        })
        .then(() => {
            console.log('New candidate added successfully!');
        })
        .catch((error) => {
            console.error('Error adding new candidate: ', error);
        });

        setNewCandidate('');
    }
  }

/*
  function addNewCandidate(event) {
    event.preventDefault();
    if (newCandidate.trim() !== '') {
      setVotantesData(prevVotantes => {
        return [
          ...prevVotantes,
          {
            name: newCandidate,
            votes: 0,
          }
        ];
      });
      setNewCandidate('');
    }
  }
*/

  return (
    <form id="add-person" onSubmit={addNewCandidate} >
        <input 
            type="text"
            value={newCandidate}
            onChange={handleInputChange}
            placeholder="Introduzca el nombre"
            />
        <button 
            type="submit"
            form="add-person"
            className="btn"
        >Agregar</button>
    </form>
  )
}

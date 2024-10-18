import './App.css';
import db from "./firebase";
import { useState, useEffect } from 'react';
import { onSnapshot, collection } from '@firebase/firestore';

function App() {

  const [votantesData, setVotantesData] = useState([]);
  
  useEffect(
    () => 
      onSnapshot(collection(db, "votantes"),(snapshot) =>
       setVotantesData(snapshot.docs.map((doc) => doc.data()))
    ),
  []);


  function plusOne(name) {
    setVotantesData(prevVotantes => {
      return prevVotantes.map(votante =>{
        if (votante.name === name) {
        return { ...votante, votes: votante.votes + 1};
      }
        return votante;
      });
    });
  }
  
  // const [votos, setVotos] = useState(0);
  const [newCandidate, setNewCandidate] = useState('')

  function handleInputChange(event) {
    setNewCandidate(event.target.value);
  }
  
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

  useEffect( () => {
    console.log(votantesData);
  }, [votantesData]);


  return (
    <>
      <h2>Vota a un delegado como coordinador de la Convención:</h2>
      
      <div id="votacion">
        {votantesData.map( (votante, index) => (
          <label key={index} className="opcion" >
            <input 
              type="radio" 
              name="opcion" 
              id={"opcion" + index } 
              value={votante.name} 
              onClick={() => plusOne(votante.name) } 
            />
            {votante.name}, {votante.votes} votos
          </label>
        ))}
      </div>

      <form id="agregarNombre">
        <div className="input-group my-3">
          <input 
            type="text"
            className="form-control"
            value={newCandidate}
            onChange={handleInputChange}
            placeholder="Agregar nuevo elector"
            aria-describedby="agregar-nombre"
            />
          <button 
            type="button" 
            id="agregar-nombre"
            className="btn btn-success"
            onClick={addNewCandidate} 
            >Agregar</button>
        </div>
      </form>
    </>
  )
}


export default App

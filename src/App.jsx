import { useState, useEffect } from 'react';
import './App.css';


function App() {

//AGREGAR VOTANTE
const [votantesData, setVotantesData] = useState( [
    {
      "name": "Anis",
      "votes": 0
    },
    {
      "name": "Ancor",
      "votes": 0
    },
    {
      "name": "Glòria",
      "votes": 0
    },
    {
      "name": "Sergio",
      "votes": 0
    },
    {
      "name": "Somhairle",
      "votes": 0
    },
    {
      "name": "Óscar",
      "votes": 0
    },
    {
      "name": "Rubén",
      "votes": 0
    },
    {
      "name": "Virginia",
      "votes": 0
    },
    {
      "name": "Mayca",
      "votes": 0
    }
  ]);
   

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
  
  const [votos, setVotos] = useState(0);
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

      <form>
        <input 
          type="text"
          value={newCandidate}
          onChange={handleInputChange}
          placeholder="Introduzca el nombre"
          />
        <button 
          type="button" 
          className="btn"
          onClick={addNewCandidate} 
        >Agregar</button>
      </form>
    </>
  )
}


export default App

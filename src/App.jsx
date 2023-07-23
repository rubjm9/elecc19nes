import { useState, useEffect } from 'react';
import './App.css';

function App() {
  
  const votantes = [
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
  ];
   
  const [votantesData, setVotantesData] = useState(votantes);

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
  

  useEffect( () => {
    console.log(votantesData);
  }, [votantesData]);

  return (
    <>
      <h2>Vota a un delegado como coordinador de la Convención:</h2>
      <form id="votacion">
          {votantesData.map( (votante, index) => (
              <label key={index} className="opcion" >
                <input 
                  type="radio" 
                  name="opcion" 
                  id={"opcion" + index } 
                  value={votante.name} 
                  onClick={() => plusOne(votante.name) } 
                />
                {votante.name}, {votante.votes} votos.
              </label>
          ))}
        <button type="submit" className="btn" >Agregar</button>
      </form>
    </>
  )
}

export default App

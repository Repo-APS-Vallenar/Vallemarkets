import React from 'react';

function App() {
  console.log('🎯 App-debug cargando...');
  
  return (
    <div style={{padding: '20px', background: 'green', color: 'white'}}>
      <h1>🎯 APP DEBUG - SI VES ESTO, EL APP.TSX FUNCIONA</h1>
      <p>Fecha: {new Date().toLocaleString()}</p>
    </div>
  );
}

export default App;

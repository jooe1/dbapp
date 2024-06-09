import { useState } from 'react';
import './App.css';
import Compare2Page from './Compare2Page';

import ComparePage from './ComparePage';



function App() {

  const [singlePage, setSinglepage] = useState(true)
  const changePage = (sp) => {
    setSinglepage(sp);
  }

  return (
    <div className="App">
      {
        (singlePage)? <ComparePage changePage={changePage}/>:<Compare2Page changePage={changePage}/>
      }
    </div>
  );
}

export default App;

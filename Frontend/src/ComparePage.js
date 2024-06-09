import React, { useState, useEffect, useRef } from 'react';
// import ChartSection from './ChartSection';
import CommonChart from './CommonChart';


const ComparePage = ({changePage}) => {
    const [selectedOption1, setSelectedOption1] = useState("Table 1");
    const [tablesNames, setTableNames] = useState([])
    const [measures, setMeasrues] = useState({})
    const [measureList, setMeasureList] = useState([])
    const [labels, setLabels] = useState([])
    const [currentMeasure, setCurrentMeasure] = useState(0);
    const inputRef = useRef(null);



    // get all the available tables to use in dropdown menus
    const getTableNames = async  () =>{
        
        try {
            const response = await fetch('http://localhost:5000/tables');
            const res = await response.json();
    
            // setData(result);
            const names = res.data
            let finalNames = []
            for (let i = 0; i < names.length; i++) {
                if(!names[i][0].includes("_summary"))
                    continue;
                let txt = names[i][0].replace("_summary", "");
                txt = txt.replace(new RegExp("_", 'g'), " ")
                finalNames.push(txt);
            } 

            finalNames.push("add new table")

            setTableNames(finalNames)
            if (res.data) {
                setSelectedOption1(finalNames[0]);
                
            }

        } catch (error) {
            console.error('Error fetching data:', error);
            // setError(['Failed to fetch data']);
          }
    }

    useEffect(() => {
        try {
            getTableNames();
        } catch (error) {
            console.log("error fetching the data");
        }
    },[])


    const updateMeasuresList = (key, value) => {
        setMeasrues(prevMeasures => ({
          ...prevMeasures,
          [key]: value,
        }));

        const newMeasureList = Object.keys(value).filter(m => m !== "labels");

        if(newMeasureList.length !== measureList.length){

            setMeasureList([...new Set([...measureList, ...newMeasureList])])
        }
        updataLabels(value["labels"]);
        


      };

      const updataLabels = (lb) => {
        const newLabels = [...new Set([...lb, ...labels])].sort((a, b) => a - b);
        setLabels(newLabels)
      }
    
      const getCurrentMeasureList = () =>{
        const keys = Object.keys(measures)
        if(keys.length === 0){
            return [];
        }
        const cm = measureList[currentMeasure];
        let datasets = [Object.keys(measures).length]
        let i = 0
        for(const measureName in measures){
            const dt = (cm in measures[measureName])? measures[measureName][cm] : []
            const dataset = {
                label: measureName,
                data: dt,
                borderWidth: 1,
                labels: measures[measureName]["labels"]

            }
            datasets[i] = dataset;
            i++;
        }
        return datasets
      }


    const selectOption1 = async (option) => {
        // Adding a new option will add a new entry to the measures table  

        // Check if user is trying to add a new table
        if(selectedOption1 === "add new table"){
            handleAddTable()
            return
        }

        if(selectedOption1 in measures){
            // Table summary already fetched
            
            return;
        }

        const requestOptions = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
        };
        const optionName = selectedOption1.replace(new RegExp(" ", 'g'), "_" )
        fetch("http://localhost:5000/summary?tableName="+optionName, requestOptions)
        .then(response => response.json())
        .then(data => {
            if(data.success === false){
                console.log("failed to fetch data from database\n error: "+ data.error);
                return
            }
            delete data.success;

            updateMeasuresList(selectedOption1, data)
            return
        })
        .catch(error => {
            console.error('Error:', error);
        });
        

    }

    const displayNextMeasure = () =>  {
        if(currentMeasure === (measureList.length - 1) ) {
            return
        }
        if(currentMeasure === (measureList.length - 2)) {
            // lock the right button
            const la = document.getElementById("right-arrow");
            la.innerText = " ▷ "
        }

        if(currentMeasure === 0 ) {
            // unlock the left button
            const la = document.getElementById("left-arrow");
            la.innerText = " ◀ "
        }



        setCurrentMeasure(currentMeasure +1 ) 

    }

    const displayPreviousMeasure = () => {
        if(currentMeasure === 0) {
            return
        }
        if(currentMeasure === 1) {
            // lock the left button
            const la = document.getElementById("left-arrow");
            la.innerText = " ◁ "
        }

        if(currentMeasure === (measureList.length - 1) ) {
            // unlock the right button
            const la = document.getElementById("right-arrow");
            la.innerText = " ▶ "
        }



        setCurrentMeasure(currentMeasure -1) 
    }

    
    const handleFileChange = (event) => {
        const selectedFile = event.target.files[0];
        inputRef.current = selectedFile
       

    }
    
    const handleAddTable = () => {
        const dialog = document.getElementById("new-table-dialog");
      
        if(dialog !== null) {
          dialog.showModal();
        }
  
    }
    const cancelAddTable  =() => {
        const dialog = document.getElementById("new-table-dialog");
        dialog.close();
  
    }

    const disableMouse = () => {
        document.querySelectorAll('button').forEach((element) => {
            element.style.pointerEvents = 'none';
        });
        document.body.style.cursor = "wait";

    }

    const enableMouse = () => {
        document.querySelectorAll('button').forEach((element) => {
            element.style.pointerEvents = 'auto';
        });
        document.body.style.cursor = "auto";

    }

    const sendTableToBackend = async  () =>{

        const inputYear = document.getElementById("input-year")

        let fileData = new FormData();
        fileData.append('file', inputRef.current); 
        fileData.append('year', inputYear.value); 

        disableMouse()

        try {
            // Send the file to the server
            const response = await fetch("http://localhost:5000/addtable", {
              method: 'POST',
              body: fileData,
            });
        
            getTableNames()
            if (response.ok) {
              console.log('File uploaded successfully');
            } else {
              console.error('Error uploading file:', response.statusText);
            }

        } catch (error) {
            console.error('Network error:', error);
        }
        enableMouse()
        cancelAddTable()
        
    }

    return (
        <div>
        <div className='top-section'>
            <div className='left-dropdown'>
                <DropDownMenu
                    selectedOption={selectedOption1}
                    onSelect={(option) => setSelectedOption1(option)}
                    tablesNames={tablesNames}
                    onSelectClick={selectOption1}
                />
            </div>
            <div className='change-page' onClick={() => changePage(false)}> <p> ↺ </p></div>

        </div>

        {
            (measureList.length > 1)? (<div id='left-arrow'  onClick={displayPreviousMeasure}>
            ◁ 
       </div>) : null
        }
        {
            (measureList.length > 1)? (<div id='right-arrow' onClick={displayNextMeasure}>
            ▶
        </div>) : null
        }
        

        <dialog id='new-table-dialog' data-modal>
            <div className='new-table-container'>
                <h2> Add new Table</h2>

                <input
                type="file"
                title='choose a file'
                onChange={handleFileChange}
                
                />

                <input id='input-year' type="text" placeholder="year of the text" />

                <div className='dialog-buttons'>
                    <button onClick={sendTableToBackend}>Add</button>
                    <button onClick={cancelAddTable}>Cancel</button>
                </div>

            </div>

        </dialog>

        <CommonChart 
        sectionName={measureList[currentMeasure]}
        datasets={getCurrentMeasureList()}
        labels={labels}
        currentMeasure={currentMeasure}
        />

        </div>
    );
};

const DropDownMenu = ({ selectedOption, onSelect, tablesNames, onSelectClick }) => {
  return (
    <div className='select-section'>
    <select value={selectedOption} onChange={(e) => onSelect(e.target.value)}>
      {/* <option value="option1">Option 1</option>
      <option value="option2">Option 2</option> */}
        {tablesNames.map(table => (
          <option key={table} value={table} >{table}</option>
        ))}


    </select>
    <button onClick={() => onSelectClick()}>ADD</button>
    </div>
  );
};



export default ComparePage;

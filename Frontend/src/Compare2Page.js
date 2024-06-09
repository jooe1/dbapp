import React, { useState, useEffect } from 'react';
// import ChartSection from './ChartSection';
import CommonChart from './CommonChart';


const Compare2Page = ({changePage}) => {
    const [selectedOption1, setSelectedOption1] = useState("Table 1");
    const [selectedOption2, setSelectedOption2] = useState("Table 2");
    const [tablesNames, setTableNames] = useState([])
    const [dataset, setDataset] = useState([])
    const [labels, setLabels] = useState([])

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


    


    const selectOptions = async () => {
        // Adding a new option will add a new entry to the measures table  


        const requestOptions = {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json'
            },
        };
        const optionName1 = selectedOption1.replace(new RegExp(" ", 'g'), "_" )
        const optionName2 = selectedOption2.replace(new RegExp(" ", 'g'), "_" )
        fetch("http://localhost:5000/compare?tableName1="+optionName1+"&tableName2="+ optionName2, requestOptions)
        .then(response => response.json())
        .then(data => {
            if(data.success === false){
                console.log("failed to fetch data from database\n error: "+ data.error);
                return
            }
            delete data.success;

            const whitney = data.whitney;
            setLabels(data.labels)
            setDataset ( 
                
                [{            
                    label: "Mann Whitney U Test",
                    data:  whitney,
                    color: "'#FFA07A'",
                    borderColor: "'#FFA07A'",
                    backgroundColor: "'#FFA07A'",
                    labels: data.labels,
                }]
            )

            
            console.log(data);
            return
        })
        .catch(error => {
            console.error('Error:', error);
        });
        

    }

    // const displayNextMeasure = () =>  {
    //     if(currentMeasure === (measureList.length - 1) ) {
    //         return
    //     }
    //     if(currentMeasure === (measureList.length - 2)) {
    //         // lock the right button
    //         const la = document.getElementById("right-arrow");
    //         la.innerText = " ▷ "
    //     }

    //     if(currentMeasure === 0 ) {
    //         // unlock the left button
    //         const la = document.getElementById("left-arrow");
    //         la.innerText = " ◀ "
    //     }



    //     setCurrentMeasure(currentMeasure +1 ) 

    // }

    // const displayPreviousMeasure = () => {
    //     if(currentMeasure === 0) {
    //         return
    //     }
    //     if(currentMeasure === 1) {
    //         // lock the left button
    //         const la = document.getElementById("left-arrow");
    //         la.innerText = " ◁ "
    //     }

    //     if(currentMeasure === (measureList.length - 1) ) {
    //         // unlock the right button
    //         const la = document.getElementById("right-arrow");
    //         la.innerText = " ▶ "
    //     }



    //     setCurrentMeasure(currentMeasure -1) 
    // }

    console.log(dataset);

    return (
        <div>
        <div className='top-section'>
            <div className='left-dropdown' id='compare-2-left'>
            <DropDownMenu
                    selectedOption={selectedOption1}
                    onSelect={(option) => setSelectedOption1(option)}
                    tablesNames={tablesNames}
                />
            </div>
                <button id='compare-2-button' className='compare-button' onClick={() => selectOptions()}>Compare</button>
            <div className='right-dropdown' id='compare-2-right'>
                <DropDownMenu
                    selectedOption={selectedOption2}
                    onSelect={(option) => setSelectedOption2(option)}
                    tablesNames={tablesNames}
                />
            </div>

            <div className='change-page' onClick={() => changePage(true)}> <p> ↺ </p></div>

        </div>

        {/* <div id='left-arrow'  onClick={displayPreviousMeasure}>
             ◀ 
        </div>

        <div id='right-arrow' onClick={displayNextMeasure}>
            ▶
        </div> */}

        <CommonChart
            sectionName={"whitney"}
            datasets={dataset}
            labels={labels}
        />

        </div>
    );
};

const DropDownMenu = ({ selectedOption, onSelect, tablesNames }) => {
  return (
    <div className='select-section'>
    <select value={selectedOption} onChange={(e) => onSelect(e.target.value)}>
      {/* <option value="option1">Option 1</option>
      <option value="option2">Option 2</option> */}
        {tablesNames.map(table => (
          <option key={table} value={table} >{table}</option>
        ))}


    </select>
    </div>
  );
};



export default Compare2Page;

import React, { useEffect, useRef, useState } from 'react';
import Chart from 'chart.js/auto';
import zoomPlugin  from 'chartjs-plugin-zoom';
import { WordCloudController, WordElement } from 'chartjs-chart-wordcloud';

// import { Line } from 'react-chartjs-2';

Chart.register(zoomPlugin)
Chart.register(WordCloudController, WordElement);


const CommonChart = ({ sectionName, datasets, labels, currentMeasure }) => {
    // Need to check if the lables of both tables match or not. If not adjust so that all lables are there 
    const chartRef = useRef(null);
    const displayText = useRef(false);
    const currentYear = useRef(0);
    // const backgroundColors = [['rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.2)'], ['rgba(245, 40, 145, 0.8)', 'rgba(245, 40, 145, 0.8)', 'rgba(245, 40, 145, 0.8)']]
    const wordCloudColors =['#FFA07A',  '#FFD700',  '#7FFFD4',  '#00BFFF',  '#20B2AA',  '#6495ED',  '#8A2BE2',  '#FF6347',  '#FF69B4',  '#40E0D0',  '#9370DB',  '#87CEEB',  '#FFB6C1',  '#32CD32'];
    const textualLabels = useRef([]);
    const chartType = useRef("line");
    const allWordsRef = useRef([]);
    const [selectedSliderIndex, setSelectedSliderIndex] = useState(0)
    chartType.current = "line";
    if(sectionName === undefined) {
      sectionName = ""
    }
    const measureDesc = {
      "entropy": {
        name: "Temporal Entropy",
        desc: "Temporal entropy, in the context of analyzing word frequencies, measures the level of unpredictability or randomness in the distribution of word occurrences over time. It quantifies how evenly or unevenly words are distributed across different time intervals within a dataset. \nA high temporal entropy suggests that word usage fluctuates widely over time, with no clear patterns or trends. Conversely, a low temporal entropy indicates more consistent and predictable word usage over time, with certain words dominating consistently or recurring in a predictable manner.\nIf one corpus has consistently higher Temporal Entropy, it likely contains more diverse and dynamic language usage.\n If another corpus has lower Temporal Entropy, it may exhibit more stable and repetitive word patterns."
      },
      "":{
        name: "",
        desc:""
      },
      "lda": {
        name: "Latent Dirichlet Allocation (LDA)",
        desc: "LDA (Latent Dirichlet Allocation) is a statistical model used for topic modeling, a technique in natural language processing (NLP) that uncovers the underlying topics within a collection of documents or texts. LDA assumes that each document is a mixture of various topics, and each topic is a distribution of words. The values produced by LDA represent the probability of each word belonging to a particular topic. A higher probability indicates that the word is more likely to be associated with that topic. By examining the distribution of words across topics, we can gain insights into the diversity of topics present in the dataset and the degree to which different words contribute to those topics."
      },
      "simpsons":{
        name: "Simpson's Diversity Index",
        desc:"Simpson's Diversity Index is a measure commonly used to quantify the diversity or richness of species within a community or dataset. It calculates the probability that two randomly selected individuals (or in this case, words) from the dataset belong to the same species (word type). In the context of word frequencies, Simpson's Diversity Index provides insights into the variety and evenness of word usage within a text or dataset. Higher values suggest a more diverse vocabulary, while lower values suggest a more limited range of words dominating the text. It is a valuable metric for analyzing and comparing the diversity of language usage across different texts or datasets.\nIf the index is close to 1, the corpus is more diverse in terms of word usage.\n If the index is closer to 0, the corpus may be dominated by a few frequently occurring words."
      },
      "ttr":{
        name: "Type-Token Ratio (TTR)",
        desc:"The TTR (Type-Token Ratio) is a measure of lexical diversity commonly used in linguistics and natural language processing. It quantifies the relationship between the total number of unique words (types) and the total number of words (tokens) in a text or dataset. A higher TTR indicates a greater variety of distinct words relative to the total number of words, suggesting greater lexical richness or diversity. Conversely, a lower TTR suggests a more repetitive or constrained vocabulary.\nHigh TTR: The corpus likely contains diverse language usage.\n Low TTR: The corpus may be dominated by a few frequently occurring words."
      },
      "tvs":{
        name: "Top Values",
        desc:"This list highlights the most frequently occurring values, providing insight into the dominant elements within each table"
      },
      "zipf":{
        name: "Zipf's Law",
        desc:"Zipf's Law is an empirical observation about the frequency distribution of words or other entities in natural language texts. It states that in a large corpus of text, the frequency of any word is inversely proportional to its rank in the frequency table. In simpler terms, the most common word occurs approximately twice as often as the second most common word, three times as often as the third most common word, and so on.In the context of measuring diversity, Zipf's Law can be used to assess the degree to which the word frequencies in a dataset conform to this distribution. A higher level of conformity suggests that the dataset follows a pattern similar to natural language, while deviations may indicate different patterns of usage or text characteristics."
      },
      "whitney":{
        name:"Mann-Whitney U test",
        desc:"Mann-Whitney U test, also known as the Mann-Whitney-Wilcoxon test, is a non-parametric statistical test used to assess whether two independent samples come from populations with the same distribution. It is commonly used when the data do not meet the assumptions of normality required by parametric tests like the t-test. The resulting p-value from the test indicates the probability of observing the data if the null hypothesis (i.e., no difference between the groups) is true. A low p-value suggests that the observed difference in word frequencies between the two groups is unlikely to have occurred by chance alone, leading to the rejection of the null hypothesis."
      }
    }


    // const textSections = []

    labels = labels.sort()
    if(sectionName === "lda" || sectionName === "tvs"){
      displayText.current = true;
      chartType.current = "wordCloud"
      // Create a new list that contains all the labels 
      let tempLabels = []

      // Contains all the words in the wordcloud from all datasets
      let allWords = [];
      
      for(let i =0; i < datasets.length; i++){
        // Use to check if table labels contains the current year
        const labelIndex = datasets[i]["labels"].indexOf(labels[currentYear.current])
        // If table does not include current year continue to the next table
        if(labelIndex <0){
          continue;
        }

        for(let j =0 ; j < datasets[i]["data"][labelIndex].length; j++){
          // NewWord will skip the last word if the measure is top words since the last word in the sentence contains the freq of that N-gram
          const newWord = (sectionName === "lda")? datasets[i]["data"][labelIndex][j]:datasets[i]["data"][labelIndex][j].substring(0, datasets[i]["data"][labelIndex][j].lastIndexOf(" "))
          allWords.push(newWord)
        }

        // allWords.push([...datasets[i]["data"][labelIndex]])
      }
      // allWords = allWords.sort();
      allWordsRef.current = allWords;

      for(let i =0; i < datasets.length; i++){
        // Use to check if table labels contains the current year
        const labelIndex = datasets[i]["labels"].indexOf(labels[currentYear.current])
        if(labelIndex >= 0){
          // tempLabels.push(...datasets[0]["data"][labelIndex]) 
          const dt = (sectionName === "lda")? allWords.map(v => datasets[i]["data"][labelIndex].includes(v)? 20:0):
          allWords.map(v => {
            const currentWord = datasets[i]["data"][labelIndex];
            const min = parseInt(currentWord[currentWord.length-1].split(" ").pop());
            const max = parseInt(currentWord[0].split(" ").pop());
            for(let k=0; k<currentWord.length; k++ ){
              if(v === currentWord[k].substring(0, currentWord[k].lastIndexOf(" "))){
                
                const scaledSize = ((parseInt( currentWord[k].split(" ").pop()) - min) / (max - min)) * (30 - 15) + 15;

                return scaledSize
              }
            }
            return 0
          });
          

          const ds = {
            label: datasets[i]["label"],
            data:  dt,
            color: wordCloudColors[i],
            borderColor: wordCloudColors[i],
            backgroundColor: wordCloudColors[i],
            
          }
            
          

          tempLabels.push(ds)
        }

      }
      textualLabels.current = {
        labels: [...allWords],
        datasets: tempLabels,
      }

    }else{
      displayText.current = false;
      for(let i=0; i < datasets.length; i++){
        let newData = new Array(labels.length).fill(0);
        // Loop through all the labels. if the dataset does not contain a year leave it at 0 otherwise update value
        for(let j=0; j < labels.length; j++){
          const labelIndex = datasets[i].labels.indexOf(labels[j]); 
          if(labelIndex >= 0){
            newData[j] = datasets[i].data[labelIndex];
          }

        }
        datasets[i].data = newData;
        datasets[i].labels = labels

      }

    }

    const openPopup = () => {
      const dialog = document.getElementById("measure-desc-dialog");
      
      if(dialog !== null) {
        dialog.showModal();
      }

    };
    
    const closeModal = () => {
      const dialog = document.getElementById("measure-desc-dialog");
      dialog.close();
    }

    if(datasets.length > 0) {
      for(let i = 0; i < datasets.length; i++){
        datasets[i]["backgroundColor"] = wordCloudColors[i];
        datasets[i]["borderColor"] = wordCloudColors[i];
        datasets[i]["backgroundColor"] = wordCloudColors[i];
      }
  
    }


    

    useEffect(() => {
        // Data for the chart
        const data = {
            //
            labels:labels,
            datasets: datasets,
        };
    
        const options = {
            scales: {
                y: {
                    beginAtZero: false,
                    type: 'logarithmic',
                    suggestedMin: 0,  
                    suggestedMax: 1.5, 
                },
                
            },
            plugins: {        
                zoom: {
                  pan: {
                    enabled: true,
                    mode: 'xy',
                  },
                  zoom: {
                    wheel: {
                        enabled: true,
                        },
                    mode: 'xy',
                  },
                },
            },
            responsive: true,
            maintainAspectRatio: false,
        
        };

        const textptions = {
          plugins: {
            legend: true, // Keep legends to deal with words being rendered on top of each other
          },
          elements: {
            word: {
              rotate: 0,
              padding: 5,
            },
            
          },
          fit: false, // Scale word cloud to fit bounds, not sure if it affects performance
       
            
        }

        console.log(data);
        // Create the chart
        const ctx = chartRef.current.getContext('2d');
        const myChart = new Chart(ctx, {
            type: chartType.current, 
            // data: displayText.current? {datasets:[wordCloudDataOne, wordCloudDataTwo],}: data,
            data: displayText.current? textualLabels.current:data,
            options: displayText.current? textptions:options,
        });
    
        // Cleanup on component unmount
        return () => {
          myChart.destroy();
        };
        // eslint-disable-next-line
      }, [datasets.length, currentMeasure, selectedSliderIndex]);
    
      const updateSliderIndex = (event) =>{
        setSelectedSliderIndex(event.target.value)
        currentYear.current = event.target.value
      }
      console.log(labels);
      console.log(currentYear.current);
      console.log(labels[currentYear.current]);
    return (
        <div className='canvas-holder'>
          {(sectionName !== "")? (<h2>{measureDesc[sectionName].name}  <span onClick={() => openPopup()} role="img" aria-label="question"> ❓</span></h2>) : null}
          
          <canvas ref={chartRef} width="400" height="200"></canvas>
          { (displayText.current && labels.length>0)? (
            <div className='slider-holder'> 
            <input
              type="range"
              min={0}
              max={labels.length -1}
              value={selectedSliderIndex}
              onChange={updateSliderIndex}
              style={{ width: '100%' }}
            /> <p>Current year: {labels[currentYear.current].replace('y', '')}</p> </div>):(null)}
            
          
              <dialog id='measure-desc-dialog' data-modal>
                <p>{measureDesc[sectionName].desc}</p>
                <button data-close-modal onClick={closeModal} >Close</button>
              </dialog>
            
        </div>
      );
};
    

export default CommonChart;


// [
//   {
//     label: tableName1,
//     data: ttrs1, 
//     backgroundColor: ['rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.2)', 'rgba(75, 192, 192, 0.2)'],
//     borderColor: ['rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 1)'],
//     borderWidth: 1,
//     },
//     {
//     label: tableName2,
//     data: ttrs2, 
//     backgroundColor: ['rgba(245, 40, 145, 0.8)', 'rgba(245, 40, 145, 0.8)', 'rgba(245, 40, 145, 0.8)'],
//     borderColor: ['rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 1)', 'rgba(75, 192, 192, 1)'],
//     borderWidth: 1,
//     },
// ]





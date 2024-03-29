/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import * as Blockly from 'blockly';
import {blocks} from './blocks/myblocks';
import {generator} from './generators/javascript';
import {javascriptGenerator} from 'blockly/javascript';
import {save, load} from './serialization';
import {toolbox} from './toolbox';
import './index.css';

// Register the blocks and generator with Blockly
Blockly.common.defineBlocks(blocks);
Object.assign(javascriptGenerator, generator);
Blockly.ContextMenuRegistry.registry.unregister('blockComment');
Blockly.ContextMenuRegistry.registry.unregister('blockDisable');

// Set up UI elements and inject Blockly
const codeDiv = document.getElementById('generatedCode').firstChild;
const outputDiv = document.getElementById('output');
const reportDiv = document.getElementById('txtReport');
const blocklyDiv = document.getElementById('blocklyDiv');
const ws = Blockly.inject(blocklyDiv, {
  toolbox, 
        grid: {
          spacing: 20, 
          length: 3, 
          colour: 'rgb(219, 212, 201)',
          snap: true
        }, 
        move:{
          scrollbars: {
            horizontal: true,
            vertical: true
          },
        drag: true,
        wheel: true
        },
        zoom:
         {controls: true,
          wheel: true,
          startScale: 1.0,
          maxScale: 3,
          minScale: 0.3,
          scaleSpeed: 1.2,
          pinch: true}
});

var xmlText = '<xml xmlns="https://developers.google.com/blockly/xml" id="workspaceBlocks" style="display: none"><block type="info" id="TBgAn^~ir@P9*e=ib?;@" x="350" y="50"></block></xml>';
Blockly.Xml.domToWorkspace(Blockly.Xml.textToDom(xmlText), ws);

function generateID(nomeClasse) {
  nomeClasse = nomeClasse.trim().toLowerCase();
  var id = new String();
  for(let c = 0; c < nomeClasse.length; c++){
    var charCode = nomeClasse.charCodeAt(c);
    id = id + charCode;
  }
  return id;
}


export function removeLastTypedBlock(type){
  let blocks = ws.getBlocksByType(type, true);
  const index = (blocks.length) - 1;
  blocks[index].dispose(true);
}

export function getAllClassBlocksinWs(){
  const className = ['none'];
  let i = 0;
  while(i < nameBlockInWS.length){
    className.push(nameBlockInWS[i]);
    i++;
  }
  return className;
}

export function blockAlreadyInWs(new_block_name){
  let blocks = ws.getAllBlocks(true);
  let counter = -1;

  let i = 1;
  while(i < blocks.length){
    if(new_block_name.localeCompare(blocks[i].getFieldValue('NAME').toLowerCase()) == 0){
      counter++;
    }
    i++;
  }

   //un blocco lo trova sempre perchè è se stesso
   if(counter == 0){
    return false;
   }
   else if(counter > 0){
    return true;
   }
}

export function ass_agg_AlreadyInWs(new_ass_name){
  let blocks = ws.getAllBlocks(true);
  let bool = false;

  let i = 1;
  while(i < blocks.length){
    if(new_ass_name.localeCompare(blocks[i].getFieldValue('NAME').toLowerCase()) == 0){
      bool = true;
    }
    i++;
  }
  return bool;
}

export function getAlreadyInWsBlockType(new_block_name){
  let blocks = ws.getAllBlocks(true);
  let i = 1;
  let index = -1;

  while(i < blocks.length){
    if(new_block_name.localeCompare(blocks[i].getFieldValue('NAME').toLowerCase()) == 0){
      index = i;
    }
    i++;
  }
  return blocks[index].type;
}

const textReport = new Map(); //ogni oggetto è il text report di una classe (identificata con l'id -> chiave)
export function setReport(id, text){
  textReport.set(id, text);
  showReport();
}

const diagramName = document.getElementById('customTitle');
export function generateReport() {
  let i = 0;
  var concatTextReport = new String();
  if(diagramName.value != ''){
    concatTextReport = diagramName.value.toUpperCase() + ' - Diagram entities \n'; 
  }
  else{
    concatTextReport = 'Diagram entities \n'
  }
  const iterator = textReport.values();
  while(i < textReport.size){
    concatTextReport = concatTextReport + iterator.next().value + '\n'; 
    i++;
  }
  return concatTextReport;
}

export function showReport() {
  const text = generateReport();
  reportDiv.innerText = text;
}

// This function resets the code and output divs, shows the
// generated code from the workspace, and evals the code.
// In a real application, you probably shouldn't use `eval`.
const runCode = () => {
  const code = javascriptGenerator.workspaceToCode(ws);
  codeDiv.innerText = code;
  
  outputDiv.innerHTML = '';

  //eval(code);

};

// Load the initial state from storage and run the code.
//load(ws);
runCode();

// Every time the workspace changes state, save the changes to storage.
ws.addChangeListener((e) => {
  // UI events are things like scrolling, zooming, etc.
  // No need to save after one of these.
  if (e.isUiEvent) return;
  save(ws);
});



// Whenever the workspace changes meaningfully, run the code again.
ws.addChangeListener((e) => {
  // Don't run the code when the workspace finishes loading; we're
  // already running it once when the application starts.
  // Don't run the code during drags; we might have invalid state.
  if (e.isUiEvent || e.type == Blockly.Events.FINISHED_LOADING ||
    ws.isDragging()) {
    return;
  }
  runCode();
});

const nameBlockInWS = new Array();
ws.addChangeListener((e) => {
  if(e.type == Blockly.Events.BLOCK_DELETE || e.type == Blockly.Events.BLOCK_CHANGE){

    let blocks = ws.getAllBlocks(true);
    let blocksIdInWs = []; 
    
    let i = 0;
    while(i < blocks.length){
      //recupero gli id di tutti i blocchi presenti nel workspace
      blocksIdInWs.push(generateID(String(blocks[i].getFieldValue('NAME'))));
      
      let blockClass = ['default_actor', 'custom_actor', 'field_resource', 'water_resource', 'custom_resource', 'irrigation_tool', 'custom_tool', 'dss_infrastructure', 'custom_digital', 'wsn', 'internet_gateway', 'dss_software', 'custom_digital_component']
      //salvo i nomi dei blocchi presenti nel workspace per mostrarli nel selettore delle associazioni
      if(blockClass.includes(blocks[i].type) && !nameBlockInWS.includes(blocks[i].getFieldValue('NAME')) && blocks[i].getFieldValue('NAME').charCodeAt(0) != 46){
        nameBlockInWS.push(blocks[i].getFieldValue('NAME'));
      }
      i++;
    }
    
    //elimino i nomi dei blocchi non più presenti nel workspace in modo che non vengano mostrarli nel selettore delle associazioni
    nameBlockInWS.forEach((name) => {
      let blocksNow = ws.getAllBlocks(true);
      let nameBlocks = [];
      let blockClass = ['default_actor', 'custom_actor', 'field_resource', 'water_resource', 'custom_resource', 'irrigation_tool', 'custom_tool', 'dss_infrastructure', 'custom_digital', 'wsn', 'internet_gateway', 'dss_software', 'custom_digital_component']
      
      let y = 0;
      while(y < blocksNow.length){
        //salvo i nomi
        if(blockClass.includes(blocksNow[y].type)){
          nameBlocks.push(blocks[y].getFieldValue('NAME'));
        }
        y++;
      }
      if(!nameBlocks.includes(name)){
        nameBlockInWS.splice(nameBlockInWS.indexOf(name), 1);
      }
    })
    
    //elimino da textReport i report dei blocchi non più presenti nel ws
    let j = 0;
    const it = textReport.keys();
    while(j < textReport.size){
      const value = it.next().value;
      if(!blocksIdInWs.includes(value)){
        textReport.delete(value);
      }
      j++;
    }
    showReport();
  }
});
/**
 * @license
 * Copyright 2023 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {javascriptGenerator} from 'blockly/javascript';
import {blockAlreadyInWs} from'../index.js';
import {ass_agg_AlreadyInWs} from'../index.js';
import {removeLastTypedBlock} from'../index.js';
import {getAlreadyInWsBlockType} from'../index.js';
import {setReport} from'../index.js';

export const generator = Object.create(null);


//genera un ID a partire dal nome della classe
function generateID(nomeClasse) {
  nomeClasse = nomeClasse.trim().toLowerCase();
  var id = new String();
  for(let c = 0; c < nomeClasse.length; c++){
    var charCode = nomeClasse.charCodeAt(c);
    id = id + charCode;
  }
  return id;
}

//genera un ID compreso tra 10000 e 99999
function generateRandID() {
  return Math.floor(Math.random() * (99999 - 10000 + 1)) + 10000;
}

//genera il report 
function createReport(blockName, allOperations){
  const simpleReport = `\n• ${blockName.toUpperCase()} `;
  var allOpReport = new String();
  
  //se ci sono operazioni
  if(allOperations != ''){
    allOpReport = 'does: \n';
    const operations = allOperations.split(".");

    operations.forEach((operation) => {
      if(operation != ''){
        const op = operation.split(";");
        let op_name = op[0].trim();
        var op_associations = op[1];
        if(op_associations != ''){
          op_associations = ' interacting with ' + op[1];
        }
        const opReport = '\t- ' + op_name + op_associations + '\n'; 
        allOpReport = allOpReport + opReport;
      }
    })
  }
  return simpleReport + allOpReport;
}



// ------------------------------------------------------------- SCHEMA ------------------------------------------------------------- //

generator['info'] = function(block) {
  block.setDeletable(false);
  var statements_actors = javascriptGenerator.statementToCode(block, 'ACTORS');
  var statements_natural_resources = javascriptGenerator.statementToCode(block, 'NATURAL_RESOURCES');
  var statements_tool = javascriptGenerator.statementToCode(block, 'TOOL');
  var statements_digital_tool = javascriptGenerator.statementToCode(block, 'DIGITAL_TOOL');
  
  var xml_data = '<?xml version="1.0" encoding="UTF-8"?>\n';
  var xmi_data = '<xmi:XMI xmi:version="2.1" xmlns:uml="http://schema.omg.org/spec/UML/2.0" xmlns:xmi="http://schema.omg.org/spec/XMI/2.1">\n';
  var doc_data = '\t<xmi:Documentation exporter="StarUML" exporterVersion="2.0"/>\n';
  var model_data = `\t<uml:Model xmi:id="${generateRandID()}" xmi:type="uml:Model" name="RootModel">\n`;
  var pack_data = `\t\t<packagedElement xmi:id="${generateRandID()}" name="BlocklyModel" visibility="public" xmi:type="uml:Model">\n`;
  var close_xmi_data = '</xmi:XMI>\n';
  var close_model_data = '\t</uml:Model>\n';
  var close_pack_data = '\t\t</packagedElement>\n';

  return `${xml_data}${xmi_data}${doc_data}${model_data}${pack_data}${statements_actors}${statements_natural_resources}${statements_tool}${statements_digital_tool}${close_pack_data}${close_model_data}${close_xmi_data}`;
};



// ------------------------------------------------------------- ATTORI ------------------------------------------------------------- //

generator['default_actor'] = function(block) {
  var text_name = block.getFieldValue('NAME');

  if(!blockAlreadyInWs(text_name.toLowerCase())){
    var id = generateID(text_name);
    var statements_attributes = javascriptGenerator.statementToCode(block, 'ATTRIBUTES');
    var statements_operations = javascriptGenerator.statementToCode(block, 'OPERATIONS');

    const operations = statements_operations.split(".");
    var code_op_ass = new String();

    operations.forEach((operation) => {
      if(operation != ''){
        const op = operation.split(";");
        let op_name = op[0].trim();
        var id_op = generateID(op_name);

        const code_op = `\t\t\t\t<ownedOperation xmi:id="${id_op}" name="${op_name}" xmi:type="uml:Operation"/>\n`;

        let op_associations = op[1];
        const ass_names = op_associations.split(',');
        var code_associations = new String();

        ass_names.forEach((name) => {
          if(name.charCodeAt(0) != 46 && name != ''){
            if(ass_agg_AlreadyInWs(name.toLowerCase())){
              var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
              var id_first_end = generateRandID();
              var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" type="${id}">\n`;
              var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
              var id_second_end = generateRandID();
              var id_other_class = generateID(name);
              var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
              var close_end = `\t\t\t\t\t</ownedEnd>\n`;
              var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
              var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
              var close_member_code = `\t\t\t\t</ownedMember>\n`;
              var name_ass_code = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
              code_associations = code_associations + name_ass_code;
            }
          }  
        })
        code_op_ass = code_op_ass + code_op + code_associations;
      }
    })
    
    const attributes = statements_attributes.split(',');
    var code_attributes = new String();
    attributes.forEach((attribute) => {
      if(attribute != ''){
        var id_attr = generateID(attribute);
        var code_att = `\t\t\t\t<ownedAttribute xmi:id="${id_attr}" name="${attribute}" xmi:type="uml:Property"/>\n`;
        code_attributes = code_attributes + code_att;
      }
    })

    var pack_code = `\t\t\t<packagedElement xmi:id="${id}" name="${text_name}" xmi:type="uml:Class">\n${code_attributes}`;
    var close_pack_code = `\t\t\t</packagedElement>\n`;
    
    setReport(id, createReport(text_name, statements_operations));

    var code = `${pack_code}${code_op_ass}${close_pack_code}`;
    return code;
  }
  else{
    window.alert('A block with this name already exists');
    let existingBlockType = getAlreadyInWsBlockType(text_name.toLowerCase());
    if(block.type == existingBlockType){
      removeLastTypedBlock(block.type);
    }
    else{
      removeLastTypedBlock(existingBlockType);
    }
  }
};

generator['custom_actor'] = function(block) {
  var text_name = block.getFieldValue('NAME');

  if(text_name.charCodeAt(0) != 46 && text_name != ''){
    if(!blockAlreadyInWs(text_name.toLowerCase())){
      var id = generateID(text_name);
      var statements_attributes = javascriptGenerator.statementToCode(block, 'ATTRIBUTES');
      var statements_operations = javascriptGenerator.statementToCode(block, 'OPERATIONS');

      const operations = statements_operations.split(".");
      var code_op_ass = new String();

      operations.forEach((operation) => {
        if(operation != ''){
          const op = operation.split(";");
          let op_name = op[0].trim();
          var id_op = generateID(op_name);

          const code_op = `\t\t\t\t<ownedOperation xmi:id="${id_op}" name="${op_name}" xmi:type="uml:Operation"/>\n`;

          let op_associations = op[1];
          const ass_names = op_associations.split(',');
          var code_associations = new String();

          ass_names.forEach((name) => {
            if(name.charCodeAt(0) != 46 && name != ''){ 
              if(ass_agg_AlreadyInWs(name.toLowerCase())){
                var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
                var id_first_end = generateRandID();
                var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" type="${id}">\n`;
                var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
                var id_second_end = generateRandID();
                var id_other_class = generateID(name);
                var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
                var close_end = `\t\t\t\t\t</ownedEnd>\n`;
                var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
                var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
                var close_member_code = `\t\t\t\t</ownedMember>\n`;
                var name_ass_code = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
                code_associations = code_associations + name_ass_code;
              }
            }  
          })
          code_op_ass = code_op_ass + code_op + code_associations;
        }
      })

      const attributes = statements_attributes.split(',');
      var code_attributes = new String();
      attributes.forEach((attribute) => {
        if(attribute != ''){
          var id_attr = generateID(attribute);
          var code_att = `\t\t\t\t<ownedAttribute xmi:id="${id_attr}" name="${attribute}" xmi:type="uml:Property"/>\n`;
          code_attributes = code_attributes + code_att;
        }
      })

      var pack_code = `\t\t\t<packagedElement xmi:id="${id}" name="${text_name}" xmi:type="uml:Class">\n${code_attributes}`;
      var close_pack_code = `\t\t\t</packagedElement>\n`;
     
      setReport(id, createReport(text_name, statements_operations));

      var code = `${pack_code}${code_op_ass}${close_pack_code}`;
      return code;
    }
    else{
      window.alert('A block with this name already exists');
      let existingBlockType = getAlreadyInWsBlockType(text_name.toLowerCase());
      if(block.type == existingBlockType){
        removeLastTypedBlock(block.type);
      }
      else{
        removeLastTypedBlock(existingBlockType);
      }
    }
  }
};



// ------------------------------------------------------------- ATTRIBUTI ------------------------------------------------------------- //

generator['username'] = function(block) {
  var code = `username,`;
  return code;
};

generator['password'] = function(block) {
  var code = `password,`;
  return code;
};

generator['custom_attribute'] = function(block) {
  var text_name = block.getFieldValue('NAME');
  if(text_name.charCodeAt(0) != 46 && text_name != ''){
    var code =  `${text_name}`;
    return code;
  }
};

generator['id'] = function(block) {
  var code = `id,`;
  return code;
};

generator['coords'] = function(block) {
  var code = `coords,`;
  return code;
};

generator['area'] = function(block) {
  var code = `area,`;
  return code;
};



// ------------------------------------------------------------- OPERAZIONI ------------------------------------------------------------- //

generator['login'] = function(block) {
  var code = `login; .`;
  return code;
};

generator['custom_operation'] = function(block) {
  var text_name = block.getFieldValue('NAME');
  var text_motivation = block.getFieldValue('MOTIVATION'); //da usare nel report
  var text_associations = block.getFieldValue('ASSOCIATIONS');

  if(text_name.charCodeAt(0) != 46 && text_name != ''){
    var code = `${text_name};${text_associations}.`;
    return code;
  }
};



// ------------------------------------------------------------- RISORSE NATURALI ------------------------------------------------------------- //

generator['field_resource'] = function(block) {
  if(!blockAlreadyInWs('field')){
    var id = generateID('field'); 
    var statements_attributes = javascriptGenerator.statementToCode(block, 'ATTRIBUTES');
    var statements_operations = javascriptGenerator.statementToCode(block, 'OPERATIONS');

    setReport(id, `• Field`);

    const operations = statements_operations.split(".");
    var code_op_ass = new String();

    operations.forEach((operation) => {
      if(operation != ''){
        const op = operation.split(";");
        let op_name = op[0].trim();
        var id_op = generateID(op_name);

        const code_op = `\t\t\t\t<ownedOperation xmi:id="${id_op}" name="${op_name}" xmi:type="uml:Operation"/>\n`;

        let op_associations = op[1];
        const ass_names = op_associations.split(',');
        var code_associations = new String();

        ass_names.forEach((name) => {
          if(name.charCodeAt(0) != 46 && name != ''){ 
            if(ass_agg_AlreadyInWs(name.toLowerCase())){
              var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
              var id_first_end = generateRandID();
              var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" type="${id}">\n`;
              var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
              var id_second_end = generateRandID();
              var id_other_class = generateID(name);
              var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
              var close_end = `\t\t\t\t\t</ownedEnd>\n`;
              var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
              var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
              var close_member_code = `\t\t\t\t</ownedMember>\n`;
              var name_ass_code = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
              code_associations = code_associations + name_ass_code;
            }
          }  
        })
        code_op_ass = code_op_ass + code_op + code_associations;
      }
    })

    const attributes = statements_attributes.split(',');
    var code_attributes = new String();
    attributes.forEach((attribute) => {
      if(attribute != ''){
        var id_attr = generateID(attribute);
        var code_att = `\t\t\t\t<ownedAttribute xmi:id="${id_attr}" name="${attribute}" xmi:type="uml:Property"/>\n`;
        code_attributes = code_attributes + code_att;
      }
    })

    var pack_code = `\t\t\t<packagedElement xmi:id="${id}" name="Field" xmi:type="uml:Class">\n${code_attributes}`;
    var close_pack_code = `\t\t\t</packagedElement>\n`;

    setReport(id, createReport('field', statements_operations));

    var code = `${pack_code}${code_op_ass}${close_pack_code}`;
    return code;
  }
  else{
    window.alert('A block with this name already exists');
    let existingBlockType = getAlreadyInWsBlockType('field');
    if(block.type == existingBlockType){
      removeLastTypedBlock(block.type);
    }
    else{
      removeLastTypedBlock(existingBlockType);
    }
  }
};


generator['water_resource'] = function(block) {
  if(!blockAlreadyInWs('water')){
    var id = generateID('water'); 
    var statements_attributes = javascriptGenerator.statementToCode(block, 'ATTRIBUTES');
    var statements_operations = javascriptGenerator.statementToCode(block, 'OPERATIONS');

    setReport(id, `• Water`);

    const operations = statements_operations.split(".");
    var code_op_ass = new String();

    operations.forEach((operation) => {
      if(operation != ''){
        const op = operation.split(";");
        let op_name = op[0].trim();
        var id_op = generateID(op_name);

        const code_op = `\t\t\t\t<ownedOperation xmi:id="${id_op}" name="${op_name}" xmi:type="uml:Operation"/>\n`;

        let op_associations = op[1];
        const ass_names = op_associations.split(',');
        var code_associations = new String();

        ass_names.forEach((name) => {
          if(name.charCodeAt(0) != 46 && name != ''){ 
            if(ass_agg_AlreadyInWs(name.toLowerCase())){
              var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
              var id_first_end = generateRandID();
              var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" type="${id}">\n`;
              var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
              var id_second_end = generateRandID();
              var id_other_class = generateID(name);
              var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
              var close_end = `\t\t\t\t\t</ownedEnd>\n`;
              var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
              var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
              var close_member_code = `\t\t\t\t</ownedMember>\n`;
              var name_ass_code = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
              code_associations = code_associations + name_ass_code;
            }
          }  
        })
        code_op_ass = code_op_ass + code_op + code_associations;
      }
    })

    const attributes = statements_attributes.split(',');
    var code_attributes = new String();
    attributes.forEach((attribute) => {
      if(attribute != ''){
        var id_attr = generateID(attribute);
        var code_att = `\t\t\t\t<ownedAttribute xmi:id="${id_attr}" name="${attribute}" xmi:type="uml:Property"/>\n`;
        code_attributes = code_attributes + code_att;
      }
    })

    var pack_code = `\t\t\t<packagedElement xmi:id="${id}" name="Water" xmi:type="uml:Class">\n${code_attributes}`;
    var close_pack_code = `\t\t\t</packagedElement>\n`;

    var statements_generalizations = javascriptGenerator.statementToCode(block, 'GENERALIZATIONS');
    const gen_names = statements_generalizations.split(";"); //nomi delle sottoclassi separati da ';'
    var code_generalizations = new String();

    //per ogni generalizzazione inserita creo la sottoclasse corrispondente legata all'id della super classe
    gen_names.forEach((name) => {
      if(name != ''){
        var id_spec = generateID(name); //id della sotto classe
        var gen = `\t\t\t\t<generalization xmi:id="${generateRandID()}" xmi:type="uml:Generalization" specific="${id_spec}" general="${id}"/>\n`;
        var pack_gen = `\t\t\t<packagedElement xmi:id="${id_spec}" name="${name.trim()}" xmi:type="uml:Class">\n${gen}\t\t\t</packagedElement>\n`;
        code_generalizations = code_generalizations + pack_gen;
      }
    })

    setReport(id, createReport('water', statements_operations));

    var code = `${pack_code}${code_op_ass}${close_pack_code}${code_generalizations}`;
    return code;
  }
  else{
    window.alert('A block with this name already exists');
    let existingBlockType = getAlreadyInWsBlockType('water');
    if(block.type == existingBlockType){
      removeLastTypedBlock(block.type);
    }
    else{
      removeLastTypedBlock(existingBlockType);
    }
  }
};

generator['custom_resource'] = function(block) {
  var text_name = block.getFieldValue('NAME');

  if(text_name.charCodeAt(0) != 46 && text_name != ''){
    if(!blockAlreadyInWs(text_name.toLowerCase())){
      var id = generateID(text_name); 
      var statements_attributes = javascriptGenerator.statementToCode(block, 'ATTRIBUTES');
      var statements_operations = javascriptGenerator.statementToCode(block, 'OPERATIONS');

      const operations = statements_operations.split(".");
      var code_op_ass = new String();

      operations.forEach((operation) => {
        if(operation != ''){
          const op = operation.split(";");
          let op_name = op[0].trim();
          var id_op = generateID(op_name);

          const code_op = `\t\t\t\t<ownedOperation xmi:id="${id_op}" name="${op_name}" xmi:type="uml:Operation"/>\n`;

          let op_associations = op[1];
          const ass_names = op_associations.split(',');
          var code_associations = new String();

          ass_names.forEach((name) => {
            if(name.charCodeAt(0) != 46 && name != ''){ 
              if(ass_agg_AlreadyInWs(name.toLowerCase())){
                var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
                var id_first_end = generateRandID();
                var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" type="${id}">\n`;
                var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
                var id_second_end = generateRandID();
                var id_other_class = generateID(name);
                var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
                var close_end = `\t\t\t\t\t</ownedEnd>\n`;
                var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
                var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
                var close_member_code = `\t\t\t\t</ownedMember>\n`;
                var name_ass_code = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
                code_associations = code_associations + name_ass_code;
              }
            }  
          })
          code_op_ass = code_op_ass + code_op + code_associations;
        }
      })

      const attributes = statements_attributes.split(',');
      var code_attributes = new String();
      attributes.forEach((attribute) => {
        if(attribute != ''){
          var id_attr = generateID(attribute);
          var code_att = `\t\t\t\t<ownedAttribute xmi:id="${id_attr}" name="${attribute}" xmi:type="uml:Property"/>\n`;
          code_attributes = code_attributes + code_att;
        }
      })

      var pack_code = `\t\t\t<packagedElement xmi:id="${id}" name="${text_name}" xmi:type="uml:Class">\n${code_attributes}`;
      var close_pack_code = `\t\t\t</packagedElement>\n`;

      var statements_generalizations = javascriptGenerator.statementToCode(block, 'GENERALIZATIONS');
      const gen_names = statements_generalizations.split(";"); //nomi delle sottoclassi separati da ';'
      var code_generalizations = new String();

      //per ogni generalizzazione inserita creo la sottoclasse corrispondente legata all'id della super classe
      gen_names.forEach((name) => {
        if(name != ''){
          var id_spec = generateID(name); //id della sotto classe
          var gen = `\t\t\t\t<generalization xmi:id="${generateRandID()}" xmi:type="uml:Generalization" specific="${id_spec}" general="${id}"/>\n`;
          var pack_gen = `\t\t\t<packagedElement xmi:id="${id_spec}" name="${name.trim()}" xmi:type="uml:Class">\n${gen}\t\t\t</packagedElement>\n`;
          code_generalizations = code_generalizations + pack_gen;
        }
      })

      setReport(id, createReport(text_name, statements_operations));

      var code = `${pack_code}${code_op_ass}${close_pack_code}${code_generalizations}`;
      return code;
    }
    else{
      window.alert('A block with this name already exists');
      let existingBlockType = getAlreadyInWsBlockType(text_name.toLowerCase());
      if(block.type == existingBlockType){
        removeLastTypedBlock(block.type);
      }
      else{
        removeLastTypedBlock(existingBlockType);
      }
    }
  }
};



// ------------------------------------------------------------- STRUMENTI DIGITALI ------------------------------------------------------------- //

generator['dss_infrastructure'] = function(block) {
  if(!blockAlreadyInWs('dss infrastructure')){
    var id = generateID('dss infrastructure'); 
    var statements_attributes = javascriptGenerator.statementToCode(block, 'ATTRIBUTES');
    var statements_operations = javascriptGenerator.statementToCode(block, 'OPERATIONS');

    const operations = statements_operations.split(".");
    var code_op_ass = new String();

    operations.forEach((operation) => {
      if(operation != ''){
        const op = operation.split(";");
        let op_name = op[0].trim();
        var id_op = generateID(op_name);

        const code_op = `\t\t\t\t<ownedOperation xmi:id="${id_op}" name="${op_name}" xmi:type="uml:Operation"/>\n`;

        let op_associations = op[1];
        const ass_names = op_associations.split(',');
        var code_associations = new String();

        ass_names.forEach((name) => {
          if(name.charCodeAt(0) != 46 && name != ''){ 
            if(ass_agg_AlreadyInWs(name.toLowerCase())){
              var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
              var id_first_end = generateRandID();
              var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" type="${id}">\n`;
              var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
              var id_second_end = generateRandID();
              var id_other_class = generateID(name);
              var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
              var close_end = `\t\t\t\t\t</ownedEnd>\n`;
              var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
              var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
              var close_member_code = `\t\t\t\t</ownedMember>\n`;
              var name_ass_code = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
              code_associations = code_associations + name_ass_code;
            }
          }  
        })
        code_op_ass = code_op_ass + code_op + code_associations;
      }
    })

    const attributes = statements_attributes.split(',');
    var code_attributes = new String();
    attributes.forEach((attribute) => {
      if(attribute != ''){
        var id_attr = generateID(attribute);
        var code_att = `\t\t\t\t<ownedAttribute xmi:id="${id_attr}" name="${attribute}" xmi:type="uml:Property"/>\n`;
        code_attributes = code_attributes + code_att;
      }
    })

    var pack_code = `\t\t\t<packagedElement xmi:id="${id}" name="DSS infrastructure" xmi:type="uml:Class">\n${code_attributes}`;
    var close_pack_code = `\t\t\t</packagedElement>\n`;
    
    setReport(id, createReport('dss infrastructure', statements_operations));

    var code = `${pack_code}${code_op_ass}${close_pack_code}`;
    return code;
  }
  else{
    window.alert('A block with this name already exists');
    let existingBlockType = getAlreadyInWsBlockType('dss infrastructure');
    if(block.type == existingBlockType){
      removeLastTypedBlock(block.type);
    }
    else{
      removeLastTypedBlock(existingBlockType);
    }
  }
};

generator['custom_digital'] = function(block) {
  var text_name = block.getFieldValue('NAME');

  if(text_name.charCodeAt(0) != 46 && text_name != ''){
    if(!blockAlreadyInWs(text_name.toLowerCase())){
      var id = generateID(text_name);
      var statements_attributes = javascriptGenerator.statementToCode(block, 'ATTRIBUTES');
      var statements_operations = javascriptGenerator.statementToCode(block, 'OPERATIONS');

      const operations = statements_operations.split(".");
      var code_op_ass = new String();

      operations.forEach((operation) => {
        if(operation != ''){
          const op = operation.split(";");
          let op_name = op[0].trim();
          var id_op = generateID(op_name);

          const code_op = `\t\t\t\t<ownedOperation xmi:id="${id_op}" name="${op_name}" xmi:type="uml:Operation"/>\n`;

          let op_associations = op[1];
          const ass_names = op_associations.split(',');
          var code_associations = new String();

          ass_names.forEach((name) => {
            if(name.charCodeAt(0) != 46 && name != ''){ 
              if(ass_agg_AlreadyInWs(name.toLowerCase())){
                var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
                var id_first_end = generateRandID();
                var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" type="${id}">\n`;
                var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
                var id_second_end = generateRandID();
                var id_other_class = generateID(name);
                var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
                var close_end = `\t\t\t\t\t</ownedEnd>\n`;
                var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
                var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
                var close_member_code = `\t\t\t\t</ownedMember>\n`;
                var name_ass_code = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
                code_associations = code_associations + name_ass_code;
              }
            }  
          })
          code_op_ass = code_op_ass + code_op + code_associations;
        }
      })

      const attributes = statements_attributes.split(',');
      var code_attributes = new String();
      attributes.forEach((attribute) => {
        if(attribute != ''){
          var id_attr = generateID(attribute);
          var code_att = `\t\t\t\t<ownedAttribute xmi:id="${id_attr}" name="${attribute}" xmi:type="uml:Property"/>\n`;
          code_attributes = code_attributes + code_att;
        }
      })

      var pack_code = `\t\t\t<packagedElement xmi:id="${id}" name="${text_name}" xmi:type="uml:Class">\n${code_attributes}`;
      var close_pack_code = `\t\t\t</packagedElement>\n`;
      
      setReport(id, createReport(text_name, statements_operations));

      var code = `${pack_code}${code_op_ass}${close_pack_code}`;
      return code;
    }
    else{
      window.alert('A block with this name already exists');
      let existingBlockType = getAlreadyInWsBlockType(text_name.toLowerCase());
      if(block.type == existingBlockType){
        removeLastTypedBlock(block.type);
      }
      else{
        removeLastTypedBlock(existingBlockType);
      }
    }
  }
};

generator['wsn'] = function(block) {
  if(!blockAlreadyInWs('wsn')){
    var id = generateID('wsn'); 
    var statements_attributes = javascriptGenerator.statementToCode(block, 'ATTRIBUTES');
    var statements_operations = javascriptGenerator.statementToCode(block, 'OPERATIONS');

    const operations = statements_operations.split(".");
    var code_op_ass = new String();

    operations.forEach((operation) => {
      if(operation != ''){
        const op = operation.split(";");
        let op_name = op[0].trim();
        var id_op = generateID(op_name);

        const code_op = `\t\t\t\t<ownedOperation xmi:id="${id_op}" name="${op_name}" xmi:type="uml:Operation"/>\n`;

        let op_associations = op[1];
        const ass_names = op_associations.split(',');
        var code_associations = new String();

        ass_names.forEach((name) => {
          if(name.charCodeAt(0) != 46 && name != ''){ 
            if(ass_agg_AlreadyInWs(name.toLowerCase())){
              var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
              var id_first_end = generateRandID();
              var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" type="${id}">\n`;
              var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
              var id_second_end = generateRandID();
              var id_other_class = generateID(name);
              var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
              var close_end = `\t\t\t\t\t</ownedEnd>\n`;
              var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
              var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
              var close_member_code = `\t\t\t\t</ownedMember>\n`;
              var name_ass_code = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
              code_associations = code_associations + name_ass_code;
            }
          }  
        })
        code_op_ass = code_op_ass + code_op + code_associations;
      }
    })

    var text_aggregation = block.getFieldValue('AGGREGATION');
    var code_aggregation = new String();
    if(text_aggregation != '' && ass_agg_AlreadyInWs(text_aggregation.toLowerCase())){
      var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
      var id_first_end = generateRandID();
      var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" aggregation="shared" type="${id}">\n`;
      var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
      var id_second_end = generateRandID();
      var id_other_class = generateID(text_aggregation);
      var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
      var close_end = `\t\t\t\t\t</ownedEnd>\n`;
      var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
      var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
      var close_member_code = `\t\t\t\t</ownedMember>\n`;
      code_aggregation = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
      window.alert('OK! Existing block correctly identified');
    }

    const attributes = statements_attributes.split(',');
    var code_attributes = new String();
    attributes.forEach((attribute) => {
      if(attribute != ''){
        var id_attr = generateID(attribute);
        var code_att = `\t\t\t\t<ownedAttribute xmi:id="${id_attr}" name="${attribute}" xmi:type="uml:Property"/>\n`;
        code_attributes = code_attributes + code_att;
      }
    })

    var pack_code = `\t\t\t<packagedElement xmi:id="${id}" name="WSN" xmi:type="uml:Class">\n${code_attributes}`;
    var close_pack_code = `\t\t\t</packagedElement>\n`;

    setReport(id, createReport('wsn', statements_operations));
   
    var code = `${pack_code}${code_op_ass}${code_aggregation}${close_pack_code}`;
    return code;
  }
  else{
    window.alert('A block with this name already exists');
    let existingBlockType = getAlreadyInWsBlockType('wsn');
    if(block.type == existingBlockType){
      removeLastTypedBlock(block.type);
    }
    else{
      removeLastTypedBlock(existingBlockType);
    }
  }
};

generator['dss_software'] = function(block) {
  if(!blockAlreadyInWs('dss software')){
    var id = generateID('dss software'); 
   
    var statements_attributes = javascriptGenerator.statementToCode(block, 'ATTRIBUTES');
    var statements_operations = javascriptGenerator.statementToCode(block, 'OPERATIONS');

    const operations = statements_operations.split(".");
    var code_op_ass = new String();

    operations.forEach((operation) => {
      if(operation != ''){
        const op = operation.split(";");
        let op_name = op[0].trim();
        var id_op = generateID(op_name);

        const code_op = `\t\t\t\t<ownedOperation xmi:id="${id_op}" name="${op_name}" xmi:type="uml:Operation"/>\n`;

        let op_associations = op[1];
        const ass_names = op_associations.split(',');
        var code_associations = new String();

        ass_names.forEach((name) => {
          if(name.charCodeAt(0) != 46 && name != ''){ 
            if(ass_agg_AlreadyInWs(name.toLowerCase())){
              var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
              var id_first_end = generateRandID();
              var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" type="${id}">\n`;
              var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
              var id_second_end = generateRandID();
              var id_other_class = generateID(name);
              var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
              var close_end = `\t\t\t\t\t</ownedEnd>\n`;
              var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
              var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
              var close_member_code = `\t\t\t\t</ownedMember>\n`;
              var name_ass_code = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
              code_associations = code_associations + name_ass_code;
            }
          }  
        })
        code_op_ass = code_op_ass + code_op + code_associations;
      }
    })

    var text_aggregation = block.getFieldValue('AGGREGATION');
    var code_aggregation = new String();
    if(text_aggregation != '' && ass_agg_AlreadyInWs(text_aggregation.toLowerCase())){
      var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
      var id_first_end = generateRandID();
      var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" aggregation="shared" type="${id}">\n`;
      var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
      var id_second_end = generateRandID();
      var id_other_class = generateID(text_aggregation);
      var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
      var close_end = `\t\t\t\t\t</ownedEnd>\n`;
      var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
      var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
      var close_member_code = `\t\t\t\t</ownedMember>\n`;
      code_aggregation = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
      window.alert('OK! Existing block correctly identified');
    }

    const attributes = statements_attributes.split(',');
    var code_attributes = new String();
    attributes.forEach((attribute) => {
      if(attribute != ''){
        var id_attr = generateID(attribute);
        var code_att = `\t\t\t\t<ownedAttribute xmi:id="${id_attr}" name="${attribute}" xmi:type="uml:Property"/>\n`;
        code_attributes = code_attributes + code_att;
      }
    })

    var pack_code = `\t\t\t<packagedElement xmi:id="${id}" name="DSS software" xmi:type="uml:Class">\n${code_attributes}`;
    var close_pack_code = `\t\t\t</packagedElement>\n`;

    setReport(id, createReport('dss software', statements_operations));
   
    var code = `${pack_code}${code_op_ass}${code_aggregation}${close_pack_code}`;
    return code;
  }
  else{
    window.alert('A block with this name already exists');
    let existingBlockType = getAlreadyInWsBlockType('dss software');
    if(block.type == existingBlockType){
      removeLastTypedBlock(block.type);
    }
    else{
      removeLastTypedBlock(existingBlockType);
    }
  }
};

generator['internet_gateway'] = function(block) {
  if(!blockAlreadyInWs('internet gateway')){
    var id = generateID('internet gateway'); 
    var statements_attributes = javascriptGenerator.statementToCode(block, 'ATTRIBUTES');
    var statements_operations = javascriptGenerator.statementToCode(block, 'OPERATIONS');

    const operations = statements_operations.split(".");
    var code_op_ass = new String();

    operations.forEach((operation) => {
      if(operation != ''){
        const op = operation.split(";");
        let op_name = op[0].trim();
        var id_op = generateID(op_name);

        const code_op = `\t\t\t\t<ownedOperation xmi:id="${id_op}" name="${op_name}" xmi:type="uml:Operation"/>\n`;

        let op_associations = op[1];
        const ass_names = op_associations.split(',');
        var code_associations = new String();

        ass_names.forEach((name) => {
          if(name.charCodeAt(0) != 46 && name != ''){ 
            if(ass_agg_AlreadyInWs(name.toLowerCase())){
              var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
              var id_first_end = generateRandID();
              var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" type="${id}">\n`;
              var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
              var id_second_end = generateRandID();
              var id_other_class = generateID(name);
              var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
              var close_end = `\t\t\t\t\t</ownedEnd>\n`;
              var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
              var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
              var close_member_code = `\t\t\t\t</ownedMember>\n`;
              var name_ass_code = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
              code_associations = code_associations + name_ass_code;
            }
          }  
        })
        code_op_ass = code_op_ass + code_op + code_associations;
      }
    })

    var text_aggregation = block.getFieldValue('AGGREGATION');
    var code_aggregation = new String();
    if(text_aggregation != '' && ass_agg_AlreadyInWs(text_aggregation.toLowerCase())){
      var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
      var id_first_end = generateRandID();
      var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" aggregation="shared" type="${id}">\n`;
      var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
      var id_second_end = generateRandID();
      var id_other_class = generateID(text_aggregation);
      var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
      var close_end = `\t\t\t\t\t</ownedEnd>\n`;
      var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
      var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
      var close_member_code = `\t\t\t\t</ownedMember>\n`;
      code_aggregation = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
      window.alert('OK! Existing block correctly identified');
    }

    const attributes = statements_attributes.split(',');
    var code_attributes = new String();
    attributes.forEach((attribute) => {
      if(attribute != ''){
        var id_attr = generateID(attribute);
        var code_att = `\t\t\t\t<ownedAttribute xmi:id="${id_attr}" name="${attribute}" xmi:type="uml:Property"/>\n`;
        code_attributes = code_attributes + code_att;
      }
    })

    var pack_code = `\t\t\t<packagedElement xmi:id="${id}" name="Internet gateway" xmi:type="uml:Class">\n${code_attributes}`;
    var close_pack_code = `\t\t\t</packagedElement>\n`;

    setReport(id, createReport('internet gateway', statements_operations));
   
    var code = `${pack_code}${code_op_ass}${code_aggregation}${close_pack_code}`;
    return code;
  }
  else{
    window.alert('A block with this name already exists');
    let existingBlockType = getAlreadyInWsBlockType('internet gateway');
    if(block.type == existingBlockType){
      removeLastTypedBlock(block.type);
    }
    else{
      removeLastTypedBlock(existingBlockType);
    }
  }
};

generator['custom_digital_component'] = function(block) {
  var text_name = block.getFieldValue('NAME');
  if(text_name.charCodeAt(0) != 46 && text_name != ''){
    if(!blockAlreadyInWs(text_name.toLowerCase())){
      var id = generateID(text_name);
      var statements_attributes = javascriptGenerator.statementToCode(block, 'ATTRIBUTES');
      var statements_operations = javascriptGenerator.statementToCode(block, 'OPERATIONS');

      const operations = statements_operations.split(".");
      var code_op_ass = new String();

      operations.forEach((operation) => {
        if(operation != ''){
          const op = operation.split(";");
          let op_name = op[0].trim();
          var id_op = generateID(op_name);

          const code_op = `\t\t\t\t<ownedOperation xmi:id="${id_op}" name="${op_name}" xmi:type="uml:Operation"/>\n`;

          let op_associations = op[1];
          const ass_names = op_associations.split(',');
          var code_associations = new String();

          ass_names.forEach((name) => {
            if(name.charCodeAt(0) != 46 && name != ''){ 
              if(ass_agg_AlreadyInWs(name.toLowerCase())){
                var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
                var id_first_end = generateRandID();
                var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" type="${id}">\n`;
                var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
                var id_second_end = generateRandID();
                var id_other_class = generateID(name);
                var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
                var close_end = `\t\t\t\t\t</ownedEnd>\n`;
                var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
                var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
                var close_member_code = `\t\t\t\t</ownedMember>\n`;
                var name_ass_code = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
                code_associations = code_associations + name_ass_code;
              }
            }  
          })
          code_op_ass = code_op_ass + code_op + code_associations;
        }
      })

      var text_aggregation = block.getFieldValue('AGGREGATION');
      var code_aggregation = new String();
      if(text_aggregation != '' && ass_agg_AlreadyInWs(text_aggregation.toLowerCase())){
        var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
        var id_first_end = generateRandID();
        var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" aggregation="shared" type="${id}">\n`;
        var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
        var id_second_end = generateRandID();
        var id_other_class = generateID(text_aggregation);
        var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
        var close_end = `\t\t\t\t\t</ownedEnd>\n`;
        var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
        var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
        var close_member_code = `\t\t\t\t</ownedMember>\n`;
        code_aggregation = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
        window.alert('OK! Existing block correctly identified');
      }

      const attributes = statements_attributes.split(',');
      var code_attributes = new String();
      attributes.forEach((attribute) => {
        if(attribute != ''){
          var id_attr = generateID(attribute);
          var code_att = `\t\t\t\t<ownedAttribute xmi:id="${id_attr}" name="${attribute}" xmi:type="uml:Property"/>\n`;
          code_attributes = code_attributes + code_att;
        }
      })

      var pack_code = `\t\t\t<packagedElement xmi:id="${id}" name="${text_name}" xmi:type="uml:Class">\n${code_attributes}`;
      var close_pack_code = `\t\t\t</packagedElement>\n`;

      setReport(id, createReport(text_name, statements_operations));
     
      var code = `${pack_code}${code_op_ass}${code_aggregation}${close_pack_code}`;
      return code;
    }
    else{
      window.alert('A block with this name already exists');
      let existingBlockType = getAlreadyInWsBlockType(text_name.toLowerCase());
      if(block.type == existingBlockType){
        removeLastTypedBlock(block.type);
      }
      else{
        removeLastTypedBlock(existingBlockType);
      }
    }
  }
};




// ------------------------------------------------------------- STRUMENTI ------------------------------------------------------------- //

generator['irrigation_tool'] = function(block) {
  if(!blockAlreadyInWs('irrigation tool')){
    var id = generateID('irrigation tool'); 
    var statements_attributes = javascriptGenerator.statementToCode(block, 'ATTRIBUTES');
    var statements_operations = javascriptGenerator.statementToCode(block, 'OPERATIONS');

    const operations = statements_operations.split(".");
    var code_op_ass = new String();

    operations.forEach((operation) => {
      if(operation != ''){
        const op = operation.split(";");
        let op_name = op[0].trim();
        var id_op = generateID(op_name);

        const code_op = `\t\t\t\t<ownedOperation xmi:id="${id_op}" name="${op_name}" xmi:type="uml:Operation"/>\n`;

        let op_associations = op[1];
        const ass_names = op_associations.split(',');
        var code_associations = new String();

        ass_names.forEach((name) => {
          if(name.charCodeAt(0) != 46 && name != ''){  
            if(ass_agg_AlreadyInWs(name.toLowerCase())){
              var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
              var id_first_end = generateRandID();
              var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" type="${id}">\n`;
              var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
              var id_second_end = generateRandID();
              var id_other_class = generateID(name);
              var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
              var close_end = `\t\t\t\t\t</ownedEnd>\n`;
              var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
              var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
              var close_member_code = `\t\t\t\t</ownedMember>\n`;
              var name_ass_code = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
              code_associations = code_associations + name_ass_code;
            }
          }  
        })
        code_op_ass = code_op_ass + code_op + code_associations;
      }
    })

    const attributes = statements_attributes.split(',');
    var code_attributes = new String();
    attributes.forEach((attribute) => {
      if(attribute != ''){
        var id_attr = generateID(attribute);
        var code_att = `\t\t\t\t<ownedAttribute xmi:id="${id_attr}" name="${attribute}" xmi:type="uml:Property"/>\n`;
        code_attributes = code_attributes + code_att;
      }
    })

    var pack_code = `\t\t\t<packagedElement xmi:id="${id}" name="Irrigation tool" xmi:type="uml:Class">\n${code_attributes}`;
    var close_pack_code = `\t\t\t</packagedElement>\n`;

    var statements_generalizations = javascriptGenerator.statementToCode(block, 'GENERALIZATIONS');
    const gen_names = statements_generalizations.split(";"); //nomi delle sottoclassi separati da ';'
    var code_generalizations = new String();

    //per ogni generalizzazione inserita creo la sottoclasse corrispondente legata all'id della super classe
    gen_names.forEach((name) => {
      if(name != ''){
        var id_spec = generateID(name); //id della sotto classe
        var gen = `\t\t\t\t<generalization xmi:id="${generateRandID()}" xmi:type="uml:Generalization" specific="${id_spec}" general="${id}"/>\n`;
        var pack_gen = `\t\t\t<packagedElement xmi:id="${id_spec}" name="${name.trim()}" xmi:type="uml:Class">\n${gen}\t\t\t</packagedElement>\n`;
        code_generalizations = code_generalizations + pack_gen;
      }
    })

    setReport(id, createReport('irrigation tool', statements_operations));
   
    var code = `${pack_code}${code_op_ass}${close_pack_code}${code_generalizations}`;
    return code;
  }
  else{
    window.alert('A block with this name already exists');
    let existingBlockType = getAlreadyInWsBlockType('irrigation tool');
    if(block.type == existingBlockType){
      removeLastTypedBlock(block.type);
    }
    else{
      removeLastTypedBlock(existingBlockType);
    }
  }
};

generator['custom_tool'] = function(block) {
  var text_name = block.getFieldValue('NAME');
  if(text_name.charCodeAt(0) != 46 && text_name != ''){
    if(!blockAlreadyInWs(text_name.toLowerCase())){
      var id = generateID('irrigation tool'); 
      var statements_attributes = javascriptGenerator.statementToCode(block, 'ATTRIBUTES');
      var statements_operations = javascriptGenerator.statementToCode(block, 'OPERATIONS');

      const operations = statements_operations.split(".");
      var code_op_ass = new String();

      operations.forEach((operation) => {
        if(operation != ''){
          const op = operation.split(";");
          let op_name = op[0].trim();
          var id_op = generateID(op_name);

          const code_op = `\t\t\t\t<ownedOperation xmi:id="${id_op}" name="${op_name}" xmi:type="uml:Operation"/>\n`;

          let op_associations = op[1];
          const ass_names = op_associations.split(',');
          var code_associations = new String();

          ass_names.forEach((name) => {
            if(name.charCodeAt(0) != 46 && name != ''){  
              if(ass_agg_AlreadyInWs(name.toLowerCase())){
                var member_code = `\t\t\t\t<ownedMember xmi:id="${generateRandID()}" xmi:type="uml:Association">\n`;
                var id_first_end = generateRandID();
                var first_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_first_end}" xmi:type="uml:Property" type="${id}">\n`;
                var ext_code = `\t\t\t\t\t\t<xmi:Extension extender="StarUML">\n\t\t\t\t\t\t\t<stereotype value=""/>\n\t\t\t\t\t\t</xmi:Extension>\n`;
                var id_second_end = generateRandID();
                var id_other_class = generateID(name);
                var second_end_code = `\t\t\t\t\t<ownedEnd xmi:id="${id_second_end}" xmi:type="uml:Property" type="${id_other_class}">\n`;
                var close_end = `\t\t\t\t\t</ownedEnd>\n`;
                var first_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_first_end}"/>\n`;
                var second_member_end_code = `\t\t\t\t\t<memberEnd xmi:idref="${id_second_end}"/>\n`;
                var close_member_code = `\t\t\t\t</ownedMember>\n`;
                var name_ass_code = `${member_code}${first_end_code}${ext_code}${close_end}${second_end_code}${ext_code}${close_end}${first_member_end_code}${second_member_end_code}${close_member_code}`;
                code_associations = code_associations + name_ass_code;
              }
            }  
          })
          code_op_ass = code_op_ass + code_op + code_associations;
        }
      })

      const attributes = statements_attributes.split(',');
      var code_attributes = new String();
      attributes.forEach((attribute) => {
        if(attribute != ''){
          var id_attr = generateID(attribute);
          var code_att = `\t\t\t\t<ownedAttribute xmi:id="${id_attr}" name="${attribute}" xmi:type="uml:Property"/>\n`;
          code_attributes = code_attributes + code_att;
        }
      })

      var pack_code = `\t\t\t<packagedElement xmi:id="${id}" name="${text_name}" xmi:type="uml:Class">\n${code_attributes}`;
      var close_pack_code = `\t\t\t</packagedElement>\n`;

      var statements_generalizations = javascriptGenerator.statementToCode(block, 'GENERALIZATIONS');
      const gen_names = statements_generalizations.split(";"); //nomi delle sottoclassi separati da ';'
      var code_generalizations = new String();

      //per ogni generalizzazione inserita creo la sottoclasse corrispondente legata all'id della super classe
      gen_names.forEach((name) => {
        if(name != ''){
          var id_spec = generateID(name); //id della sotto classe
          var gen = `\t\t\t\t<generalization xmi:id="${generateRandID()}" xmi:type="uml:Generalization" specific="${id_spec}" general="${id}"/>\n`;
          var pack_gen = `\t\t\t<packagedElement xmi:id="${id_spec}" name="${name.trim()}" xmi:type="uml:Class">\n${gen}\t\t\t</packagedElement>\n`;
          code_generalizations = code_generalizations + pack_gen;
        }
      })

      setReport(id, createReport(text_name, statements_operations));
     
      var code = `${pack_code}${code_op_ass}${close_pack_code}${code_generalizations}`;
      return code;
    }
    else{
      window.alert('A block with this name already exists');
      let existingBlockType = getAlreadyInWsBlockType(text_name.toLowerCase());
      if(block.type == existingBlockType){
        removeLastTypedBlock(block.type);
      }
      else{
        removeLastTypedBlock(existingBlockType);
      }
    }
  }
};



// ------------------------------------------------------------- GENERALIZZAZIONI ------------------------------------------------------------- //

// la generalizzazione restituisce solo il nome
generator['dam'] = function(block) {
  if(!blockAlreadyInWs('dam')){
    var code = `Dam;`;
    return code;
  }
  else{
    window.alert('A block with this name already exists');
    let existingBlockType = getAlreadyInWsBlockType('dam');
    if(block.type == existingBlockType){
      removeLastTypedBlock(block.type);
    }
    else{
      removeLastTypedBlock(existingBlockType);
    }
  }
};

// la generalizzazione restituisce solo il nome
generator['river'] = function(block) {
  if(!blockAlreadyInWs('river')){
  var code = `River;`;
  return code;
  }
  else{
    window.alert('A block with this name already exists');
    let existingBlockType = getAlreadyInWsBlockType('river');
    if(block.type == existingBlockType){
      removeLastTypedBlock(block.type);
    }
    else{
      removeLastTypedBlock(existingBlockType);
    }
  }
};

// la generalizzazione restituisce solo il nome
generator['well'] = function(block) {
  if(!blockAlreadyInWs('well')){
    var code = `Well;`;
    return code;
  }
  else{
    window.alert('A block with this name already exists');
    let existingBlockType = getAlreadyInWsBlockType('well');
    if(block.type == existingBlockType){
      removeLastTypedBlock(block.type);
    }
    else{
      removeLastTypedBlock(existingBlockType);
    }
  }
};

// la generalizzazione restituisce solo il nome
generator['dripper'] = function(block) {
  if(!blockAlreadyInWs('dripper')){
    var code = `Dripper;`;
    return code;
  }
  else{
    window.alert('A block with this name already exists');
    let existingBlockType = getAlreadyInWsBlockType('dripper');
    if(block.type == existingBlockType){
      removeLastTypedBlock(block.type);
    }
    else{
      removeLastTypedBlock(existingBlockType);
    }
  }
};

// la generalizzazione restituisce solo il nome
generator['sprinkler'] = function(block) {
  if(!blockAlreadyInWs('sprinkler')){
    var code = `Sprinkler;`;
    return code;
  }
  else{
    window.alert('A block with this name already exists');
    let existingBlockType = getAlreadyInWsBlockType('sprinkler');
    if(block.type == existingBlockType){
      removeLastTypedBlock(block.type);
    }
    else{
      removeLastTypedBlock(existingBlockType);
    }
  }
};


// la generalizzazione restituisce solo il nome
generator['custom_generalization'] = function(block) {
  var text_name = block.getFieldValue('NAME');  
  if(text_name.charCodeAt(0) != 46 && text_name != ''){
    if(!blockAlreadyInWs(text_name.toLowerCase())){
      var code = `${text_name};`;
      return code;
    }
    else{
      window.alert('A block with this name already exists');
      let existingBlockType = getAlreadyInWsBlockType(text_name.toLowerCase());
      if(block.type == existingBlockType){
        removeLastTypedBlock(block.type);
      }
      else{
        removeLastTypedBlock(existingBlockType);
      }
    }
  }
};



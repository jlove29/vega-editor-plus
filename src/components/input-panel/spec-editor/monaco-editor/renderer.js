import React from 'react';
import {MODES} from '../../../../constants';
import MonacoEditor from 'react-monaco-editor-plus';
import {hashHistory} from 'react-router';
import parser from 'vega-schema-url-parser';

import './index.css'

const vegaSchema = require('../../../../../schema/vega.schema.json');
const vegaLiteSchema = require('../../../../../schema/vl.schema.json');

const schemas = {
  [MODES.Vega]: {
    uri: 'https://vega.github.io/schema/vega/v3.0.json',
    schema: vegaSchema,
    fileMatch: ['*']
  }, [MODES.VegaLite]: {
    uri: 'https://vega.github.io/schema/vega-lite/v2.json',
    schema: vegaLiteSchema,
    fileMatch: ['*']
  }
};

function debounce(func, wait, immediate) {
	let timeout;
	return function() {
		const context = this, args = arguments;
		const later = () => {
			timeout = null;
			if (!immediate) func.apply(context, args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func.apply(context, args);
	};
  }


export default class Editor extends React.Component {
  
  constructor(props){
    super(props);
    this.state = {shownCall: JSON.stringify(JSON.parse(this.props.value), null, '  ')};
  }
  
  static propTypes = {
    value: React.PropTypes.string,
    onChange: React.PropTypes.func
  }
  
  handleEditorChange(spec) {
    var editSpec = JSON.parse(this.props.value,null,'  ');
    editSpec.data = {'url': 'userData'};
    editSpec.description = '...';
    try {
      editSpec.encoding.x.field = '...';
      editSpec.encoding.y.field = '...';
      editSpec.encoding.size.field = '...';
      editSpec.encoding.shape.field = '...';
      editSpec.encoding.column.field = '...';
      editSpec.encoding.color.field = '...';
      editSpec.encoding.x.type = '...';
      editSpec.encoding.y.type = '...';
      editSpec.transform = '...';
      editSpec.encoding.x.axis.title = '...';
      editSpec.encoding.y.axis.title = '...';
    } catch (TypeError) {
      // eslint-disable-next-line     
      true;
    }
    var finalSpec = JSON.stringify(editSpec,null,'  ');
    
    if (this.props.hasData) {
      var editSpec2 = JSON.parse(spec);
      editSpec2.data = this.props.addData;
      var finalSpec2 = JSON.stringify(editSpec2,null,'  ');
      if (this.props.autoParse) {
        this.updateSpec(finalSpec2);
      } else {
        this.props.updateEditorString(finalSpec2);
      }
      if (hashHistory.getCurrentLocation().pathname.indexOf('/edited') === -1) {
        hashHistory.push('/edited');
      }
      this.setState({shownCall: finalSpec});
    } else {
      if (this.props.autoParse) {
        this.updateSpec(spec);
      } else {
        this.props.updateEditorString(spec);
      }
      if (hashHistory.getCurrentLocation().pathname.indexOf('/edited') === -1) {
        hashHistory.push('/edited');
      }
    }
  }

  clearFields(editSpec) {
    editSpec.description = '...';
    editSpec.encoding.x.field = '...';
    editSpec.encoding.y.field = '...';
    editSpec.encoding.size.field = '...';
    editSpec.encoding.shape.field = '...';
    editSpec.encoding.column.field = '...';
    editSpec.encoding.color.field = '...';
    editSpec.encoding.x.type = '...';
    editSpec.encoding.y.type = '...';
    editSpec.transform = '...';
    editSpec.encoding.x.axis.title = '...';
    editSpec.encoding.y.axis.title = '...';
    return editSpec;
    }
  
  componentDidMount(spec) {
    console.log(this.props.hasData);
    console.log(0);
    if (this.props.hasData) {
      var editSpec = JSON.parse(this.props.value,null,'  ');
      try {
        editSpec.data = {'url': 'userData'};
      } catch (TypeError) {
        // eslint-disable-next-line     
        true;
      }
      var editSpec2 = this.clearFields(editSpec)
      console.log(editSpec2)
      var finalSpec = JSON.stringify(editSpec2,null,'  ');
      this.setState({shownCall: finalSpec});
      this.render();
    }}

 
  editorWillMount(monaco) {
    monaco.languages.json.jsonDefaults.setDiagnosticsOptions({
      validate: true,
      allowComments: true,
      schemas: [schemas[this.props.mode]]
    });
  }

  componentWillReceiveProps(nextProps) {
    if (!nextProps.autoParse && nextProps.parse) {
      this.updateSpec(nextProps.value);
      this.props.parseSpec(false);
    }
  }
  
   manualParseSpec() {
    if (!this.props.autoParse) {
      return (
        <div className="editor-header"> 
          <button id='parse-button' onClick={() => this.props.parseSpec(true)}>Parse</button>
        </div>
      )
    } else {
      return null;
    }
  }

  updateSpec(spec) {
    let schema, parsedMode;
    try {
      schema = JSON.parse(spec).$schema;
    } catch (err) {
      console.warn('Error parsing json string');
    } 
    if (schema) {
      parsedMode = parser(schema).library;
    }  
    if (parsedMode === MODES.Vega || (!parsedMode && this.props.mode === MODES.Vega)) {
      this.props.updateVegaSpec(spec);
    } else if (parsedMode === MODES.VegaLite || (!parsedMode && this.props.mode === MODES.VegaLite)) {
      this.props.updateVegaLiteSpec(spec);
    }
  }
  

  render() {
    return (
      <div className={'full-height-wrapper'}>
        {this.manualParseSpec()}
        <MonacoEditor
          language='json'
          key={JSON.stringify(Object.assign({}, this.state, {mode: this.props.mode, selectedExample: this.props.selectedExample,
            gist: this.props.gist}))}
          options={{
            folding: true,
            scrollBeyondLastLine: true,
            wordWrap: true,
            wrappingIndent: 'same',
            automaticLayout: true,
            autoIndent: true,
            cursorBlinking: 'smooth',
            lineNumbersMinChars: 4
          }}
          defaultValue={this.state.shownCall}
          onChange={debounce(this.handleEditorChange, 700).bind(this)}
          editorWillMount={this.editorWillMount.bind(this)}
        />
        
      </div>
    );
  }
}

import { useEffect, useRef, useState } from "react";

// import { invoke } from "@tauri-apps/api/tauri";
import "./App.css";

// 导入 CodeMirror 相关组件和样式
import CodeMirror from '@uiw/react-codemirror';
import { json } from '@codemirror/lang-json';
import { go } from '@codemirror/lang-go';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { javascript } from '@codemirror/lang-javascript';
import { rust } from '@codemirror/lang-rust';
import { langs } from '@uiw/codemirror-extensions-langs';
import { dracula } from '@uiw/codemirror-theme-dracula';

import { Snackbar, Alert,Container, Grid, Input, MenuItem, Select, Typography, Paper,Switch, FormControlLabel, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import { quicktype, InputData, jsonInputForTargetLanguage } from "quicktype-core";

const getLanguageExtension = (lang: string) => {
  switch (lang) {
    case 'go':
      return go();
    case 'java':
      return java();
    case 'python':
      return python();
    case 'typescript':
      return javascript({ typescript: true });
    case 'cs':
      return langs.csharp();
    case 'swift':
      return langs.swift();
    case 'rust':
      return rust();
    case 'kotlin':
      return langs.kotlin();
    case 'cpp':
      return langs.cpp();
    case 'dart':
      return langs.dart();
    case 'javascript':
      return javascript();
    case 'php':
      return langs.php();
    case 'ruby':
      return langs.ruby();
    case 'scala':
      return langs.scala();
    default:
      return json();
  }
};

const convertToLanguage = async (jsonInput: string, language: string,topLevelName:string,interfaceOnly:boolean) => {
  const jsonInputForGo = jsonInputForTargetLanguage(language.toLowerCase());
  await jsonInputForGo.addSource({
    name: topLevelName,
    samples: [jsonInput],
  });

  const inputData = new InputData();
  inputData.addInput(jsonInputForGo);

  const { lines: generatedCode } = await quicktype({
    inputData,
    lang: language.toLowerCase(),
    rendererOptions: {
     'just-types': interfaceOnly,
    },
   
  });

  
  return generatedCode.join("\n");
};

function App() {
  //const [greetMsg, setGreetMsg] = useState("");
  // const [name, setName] = useState("");
 
  // 添加新的 state 来存储 CodeMirror 的内容
  const [code, setCode] = useState('{"name": "John", "age": 30}');
  const [goCode, setGoCode] = useState('')
  const [language, setLanguage] = useState('Go');
  const [topLevelName, setTopLevelName] = useState('MyType');
  const [darkMode, setDarkMode] = useState(true);
  const [interfaceOnly, setInterfaceOnly] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  


  const outputCodeMirrorRef = useRef(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        try {
          JSON.parse(content); // Validate JSON
          setCode(content);
        } catch (error) {
          console.error("Invalid JSON file");
          // Optionally, you can show an error message to the user here
        }
      };
      reader.readAsText(file);
    }
  };

  const copyToClipboard = () => {
    if (outputCodeMirrorRef.current) {
     
      navigator.clipboard.writeText(goCode).then(() => {
        console.log('Output copied to clipboard');
        setSnackbarOpen(true);
        // Optionally, you can show a notification to the user here
      }).catch(err => {
        console.error('Failed to copy text: ', err);
      });
    }
  };

  const handleSnackbarClose = (event?: React.SyntheticEvent | Event, reason?: string) => {
    console.log(event)
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };
  
  const theme = createTheme({
    palette: {
      mode: darkMode ? 'dark' : 'light',
      primary: {
        main: '#00bfa5',
      },
    },
  });

  const handleLanguageChange = (event: any) => {
    setLanguage(event.target.value);
    convertToLanguage(code,event.target.value,topLevelName,interfaceOnly).then(setGoCode)
  };

  useEffect(() => {
    convertToLanguage(code,language,topLevelName,interfaceOnly).then(setGoCode)
  }, [code,language,topLevelName,interfaceOnly])
  
  // async function greet() {
  //   // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
  //   setGreetMsg(await invoke("greet", { name }));
  // }

  console.log(quicktype)

  return (
    <ThemeProvider theme={theme}>
      {/* <Paper sx={{ minHeight: '100vh', borderRadius: 0 }}> */}
      <Paper sx={{ height: '100vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', borderRadius: 0 }}>

        <Container maxWidth="lg" sx={{ pt: 4, pb: 4 }}>
          <Typography variant="h4" gutterBottom>
            QuickType JSON Converter <FormControlLabel
                control={
                  <Switch
                    checked={darkMode}
                    onChange={() => setDarkMode(!darkMode)}
                    color="primary"
                  />
                }
                label={darkMode ? "Dark Mode" : "Light Mode"}
              />
          </Typography>
          <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
           
         
            <Grid item xs={12} sm={4}>
              <Input
                fullWidth
                placeholder="Top Level Name"
                value={topLevelName}
                onChange={(e) => setTopLevelName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <Select
                sx={{width: '8vw',mr:'20px'}}
                size="small"
                value={language}
                onChange={handleLanguageChange}
              >
                <MenuItem value="Cpp">C++</MenuItem>
                <MenuItem value="Csharp">C#</MenuItem>
                <MenuItem value="Dart">Dart</MenuItem>
                <MenuItem value="Go">Go</MenuItem>
                <MenuItem value="Java">Java</MenuItem>
                <MenuItem value="JavaScript">JavaScript</MenuItem>
                <MenuItem value="Kotlin">Kotlin</MenuItem>
                <MenuItem value="Php">PHP</MenuItem>
                <MenuItem value="Python">Python</MenuItem>
                <MenuItem value="Ruby">Ruby</MenuItem>
                <MenuItem value="Rust">Rust</MenuItem>
                <MenuItem value="Scala">Scala</MenuItem>
                <MenuItem value="Swift">Swift</MenuItem>
                <MenuItem value="Typescript">TypeScript</MenuItem>
              </Select>
              <input
                type="file"
                accept=".json"
                style={{ display: 'none' }}
                id="json-file-input"
                onChange={handleFileUpload}
              />
              <label htmlFor="json-file-input">
                <Button variant="contained" component="span">
                  File
                </Button>
                
              </label>
              
            </Grid>
           
          </Grid>
          
          <Grid container spacing={2} >
            <Grid item xs={12} md={5}>
              <Typography variant="h6" gutterBottom>
                JSON Input
              </Typography>
              <CodeMirror
                value={code}
                height="600px"
                theme={darkMode ? dracula : 'light'}
                extensions={[json()]}
                onChange={(value) => setCode(value)}
              />
            </Grid>
            <Grid item xs={12} md={7}>
              <Typography variant="h6" gutterBottom>
                {language} Output<FormControlLabel
                control={
                  <Switch
                    checked={interfaceOnly}
                    onChange={() => setInterfaceOnly(!interfaceOnly)}
                    color="primary"
                  />
                }
                label={"Interface Only"}
                sx={{float:'right'}}
              />
              </Typography>
              
              <CodeMirror
                value={goCode}
                height="600px"
                theme={darkMode ? dracula : 'light'}
                extensions={[getLanguageExtension(language.toLowerCase())]}
                readOnly={true}
                basicSetup={{
                  lineNumbers: false,
                }}
                ref={outputCodeMirrorRef}
                onDoubleClick={copyToClipboard}
              />
            </Grid>
          </Grid>
        </Container>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={3000}
          onClose={handleSnackbarClose}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        >
          <Alert onClose={handleSnackbarClose} severity="success" sx={{ width: '100%' }}>
            Output copied to clipboard
          </Alert>
        </Snackbar>
      </Paper>
    </ThemeProvider>
  );
}

export default App;

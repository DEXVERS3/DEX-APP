'@@ -20,61 +20,45 @@ const MODE_PRESETS = {

  },

};




function buildMockOutput(input, mode) {


  const trimmed = (input || '').trim();


  if (!trimmed) return '';





  const header =


    mode === 'post'


      ? 'Draft (Post)'


      : mode === 'email'


        ? 'Draft (Email)'


        : 'Notes (Strategy)';





  return `${header}\n\n${trimmed}\n\n—\nDex v1 shell is live. Next: wire the Generate button to your Dex engine.`;


}';


Remove leftover mock function fragment


  

export default function Page() {

  const [mode, setMode] = useState('post');

  const [input, setInput] = useState('');

  const [output, setOutput] = useState('');



  const preset = useMemo(() => MODE_PRESETS[mode], [mode]);




 const onGenerate = async () => {


  const trimmed = (input || '').trim();


  if (!trimmed) return;


  const onGenerate = async () => {


    const trimmed = (input || '').trim();


    if (!trimmed) return;




  setOutput('Generating…');


    setOutput('Generating…');




  try {


    const res = await fetch('/api/generate', {


      method: 'POST',


      headers: { 'Content-Type': 'application/json' },


      body: JSON.stringify({ input: trimmed, mode }),


    });


    try {


      const res = await fetch('/api/generate', {


        method: 'POST',


        headers: { 'Content-Type': 'application/json' },


        body: JSON.stringify({ input: trimmed, mode }),


      });




    const data = await res.json();


      const data = await res.json();




    if (!res.ok) {


      setOutput(`Error: ${data?.error || 'Request failed.'}\n\n${data?.detail || ''}`);


      return;


    }





    setOutput(data.output || '(Empty output.)');


  } catch (err) {


    setOutput(`Error: ${String(err?.message || err)}`);


  }


};


      if (!res.ok) {


        setOutput(`Error: ${data?.error || 'Request failed.'}\n\n${data?.detail || ''}`);


        return;


      }




      setOutput(data.output || '(Empty output.)');


    } catch (err) {


      setOutput(`Error: ${String(err?.message || err)}`);


    }


  };



  const onCopy = async () => {

    try {

      await navigator.clipboard.writeText(output);

      alert('Copied.');

    } catch {


      alert('Copy failed. Select the text and copy manually.');


      alert('Copy failed. Select text and copy manually.');

    }

  };



@@ -148,9 +132,7 @@ export default function Page() {

          </button>

        </div>




        <div style={styles.footer}>


          v1 product surface is live. Next: connect generation + payments.


        </div>


        <div style={styles.footer}>Jim Core online.</div>

      </div>

    </main>



const KEY = "AIzaSyA16eqhdyX2_zTMy70ru_JVhWVG8p1chiQ";

async function listarModelos() {
  console.log("--- BUSCANDO MODELOS DISPONÍVEIS ---");
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1/models?key=${KEY}`);
    const data = await res.json();
    
    if (res.ok) {
      console.log("✅ Modelos encontrados:");
      data.models.forEach(m => {
        console.log(`- ${m.name.replace('models/', '')}`);
      });
    } else {
      console.log("❌ ERRO:", data.error?.message);
    }
  } catch (e) {
    console.log("❌ FALHA:", e.message);
  }
}

listarModelos();
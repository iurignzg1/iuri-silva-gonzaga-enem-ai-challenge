import styles from "../../pages/Simulados.module.css";

const QuestaoEnunciado = ({ texto, imagensExtras = [] }) => {
  if (!texto && (!imagensExtras || imagensExtras.length === 0)) return null;

  const urlRegex = /!\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
  const imagensEncontradas = new Set();
  const partes = [];
  let ultimoIndice = 0;
  let match;

  if (texto) {
    while ((match = urlRegex.exec(texto)) !== null) {
      const inicio = match.index;
      const fim = urlRegex.lastIndex;

      if (inicio > ultimoIndice) {
        const trechoTexto = texto.slice(ultimoIndice, inicio).trim();
        if (trechoTexto) {
          partes.push({ tipo: "texto", conteudo: trechoTexto });
        }
      }

      const alt = match[1];
      const url = match[2];
      imagensEncontradas.add(url);
      partes.push({ tipo: "imagem", url, alt: alt || "Figura da questão" });

      ultimoIndice = fim;
    }

    if (ultimoIndice < texto.length) {
      const trechoTexto = texto.slice(ultimoIndice).trim();
      if (trechoTexto) {
        partes.push({ tipo: "texto", conteudo: trechoTexto });
      }
    }
  }

  const adicionais = (imagensExtras || []).filter(url => !imagensEncontradas.has(url));

  return (
    <div className={styles.questionContext}>
      {partes.map((p, idx) => {
        if (p.tipo === "imagem") {
          return (
            <div key={idx} className={styles.imageWrapper}>
              <img 
                src={p.url} 
                alt={p.alt} 
                className={styles.questionImage} 
                loading="lazy" 
              />
            </div>
          );
        }
        return (
          <p key={idx} className={styles.questionParagraph}>
            {p.conteudo}
          </p>
        );
      })}

      {adicionais.map((url, idx) => (
        <div key={`extra-${idx}`} className={styles.imageWrapper}>
          <img 
            src={url} 
            alt={`Figura complementar ${idx + 1}`} 
            className={styles.questionImage} 
            loading="lazy" 
          />
        </div>
      ))}
    </div>
  );
};

export default QuestaoEnunciado;

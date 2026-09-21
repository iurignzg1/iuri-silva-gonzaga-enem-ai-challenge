/**
 * Utilitários estatísticos e cálculos de métricas do Dashboard
 */

export const calcularMediaNotas = (historico, pesos = { matematica: 1, natureza: 1, humanas: 1, linguagens: 1 }) => {
  if (!historico || historico.length === 0) return "—";

  const maisRecentes = {
    matematica: null,
    natureza: null,
    humanas: null,
    linguagens: null
  };

  const ordenados = [...historico].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  for (const s of ordenados) {
    const notas = s.notasPorMateria || {};
    if (maisRecentes.matematica === null && typeof notas.matematica === "number" && notas.matematica > 0) {
      maisRecentes.matematica = notas.matematica;
    }
    if (maisRecentes.natureza === null && typeof notas.natureza === "number" && notas.natureza > 0) {
      maisRecentes.natureza = notas.natureza;
    }
    if (maisRecentes.humanas === null && typeof notas.humanas === "number" && notas.humanas > 0) {
      maisRecentes.humanas = notas.humanas;
    }
    if (maisRecentes.linguagens === null && typeof notas.linguagens === "number" && notas.linguagens > 0) {
      maisRecentes.linguagens = notas.linguagens;
    }
  }

  let somaPonderada = 0;
  let somaPesos = 0;

  for (const [area, nota] of Object.entries(maisRecentes)) {
    if (typeof nota === "number" && nota > 0) {
      const peso = pesos[area] || 1;
      somaPonderada += nota * peso;
      somaPesos += peso;
    }
  }

  if (somaPesos === 0) {
    return (historico.reduce((acc, s) => acc + (s.notaPonderada || 0), 0) / historico.length).toFixed(1);
  }

  return (somaPonderada / somaPesos).toFixed(1);
};

export const calcularRecordesPorArea = (historico) => {
  const maxNotas = { matematica: 0, natureza: 0, humanas: 0, linguagens: 0 };
  const contagem = { matematica: 0, natureza: 0, humanas: 0, linguagens: 0 };

  (historico || []).forEach(s => {
    const notas = s.notasPorMateria || {};
    if (typeof notas.matematica === "number" && notas.matematica > 0) {
      if (notas.matematica > maxNotas.matematica) maxNotas.matematica = notas.matematica;
      contagem.matematica++;
    }
    if (typeof notas.natureza === "number" && notas.natureza > 0) {
      if (notas.natureza > maxNotas.natureza) maxNotas.natureza = notas.natureza;
      contagem.natureza++;
    }
    if (typeof notas.humanas === "number" && notas.humanas > 0) {
      if (notas.humanas > maxNotas.humanas) maxNotas.humanas = notas.humanas;
      contagem.humanas++;
    }
    if (typeof notas.linguagens === "number" && notas.linguagens > 0) {
      if (notas.linguagens > maxNotas.linguagens) maxNotas.linguagens = notas.linguagens;
      contagem.linguagens++;
    }
  });

  return {
    matematica: contagem.matematica ? maxNotas.matematica.toFixed(1) : null,
    natureza: contagem.natureza ? maxNotas.natureza.toFixed(1) : null,
    humanas: contagem.humanas ? maxNotas.humanas.toFixed(1) : null,
    linguagens: contagem.linguagens ? maxNotas.linguagens.toFixed(1) : null,
    contagem
  };
};

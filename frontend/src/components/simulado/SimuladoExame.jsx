import { FiArrowLeft, FiArrowRight } from "react-icons/fi";
import QuestaoEnunciado from "./QuestaoEnunciado";
import styles from "../../pages/Simulados.module.css";

const SimuladoExame = ({
  questoes,
  indiceAtual,
  setIndiceAtual,
  respostas,
  onSelectAlternativa,
  onFinalizar,
  finalizando
}) => {
  const q = questoes[indiceAtual];
  const questaoId = q.index;
  const alternativaEscolhida = respostas[questaoId];

  return (
    <div className={styles.container}>
      {/* Top Bar */}
      <div className={styles.examTopBar}>
        <div className={styles.examMeta}>
          <span className={styles.areaTag}>{q.disciplina?.replace("-", " ")}</span>
          <span className={styles.questionCount}>
            Questão {indiceAtual + 1} de {questoes.length}
          </span>
        </div>

        <button 
          onClick={onFinalizar}
          disabled={finalizando}
          className={styles.submitExamBtn}
        >
          {finalizando ? "Processando..." : "Entregar Prova"}
        </button>
      </div>

      {/* Question Card */}
      <div className={styles.questionCard}>
        <QuestaoEnunciado texto={q.enunciado} imagensExtras={q.imagens} />

        {q.comando && (
          <div className={styles.questionPrompt}>{q.comando}</div>
        )}

        <div className={styles.optionsList}>
          {q.alternativas?.map(alt => {
            const selecionada = alternativaEscolhida === alt.letra;
            return (
              <div 
                key={alt.letra}
                onClick={() => onSelectAlternativa(questaoId, alt.letra)}
                className={`${styles.optionItem} ${selecionada ? styles.optionSelected : ""}`}
              >
                <span className={styles.optionLetter}>{alt.letra}</span>
                <div className={styles.altContent}>
                  {alt.texto && <span className={styles.optionText}>{alt.texto}</span>}
                  {alt.imagem && (
                    <img 
                      src={alt.imagem} 
                      alt={`Alternativa ${alt.letra}`} 
                      className={styles.altImage} 
                      loading="lazy" 
                    />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation Bar */}
      <div className={styles.examNavBar}>
        <button 
          onClick={() => setIndiceAtual(prev => Math.max(0, prev - 1))}
          disabled={indiceAtual === 0}
          className={styles.navButton}
        >
          <FiArrowLeft size={14} /> Anterior
        </button>

        <span className={styles.answeredCount}>
          {Object.keys(respostas).length} de {questoes.length} respondidas
        </span>

        <button 
          onClick={() => setIndiceAtual(prev => Math.min(questoes.length - 1, prev + 1))}
          disabled={indiceAtual === questoes.length - 1}
          className={styles.navButton}
        >
          Próxima <FiArrowRight size={14} />
        </button>
      </div>
    </div>
  );
};

export default SimuladoExame;

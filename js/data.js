// Example data for testing the app
export const evaluationItems = [
    { id: 1, category: "Identidad profesional", text: "Comprendo y respondo a las necesidades formativas de los estudiantes" },
    { id: 2, category: "Identidad profesional", text: "Reflexiono y genero cambios en mis prácticas pedagógicas a partir de los resultados de aprendizaje de mis estudiantes" },
    { id: 3, category: "Pedagogía", text: "Me mantengo actualizado en estrategias de enseñanza y sobre modos de aprendizaje" },
    { id: 4, category: "Pedagogía", text: "Diseño actividades de aprendizaje que responden a diferentes estilos y ritmos de aprendizaje" },
    { id: 5, category: "Conocimiento disciplinar", text: "Domino mi área de conocimiento de tal manera que utilizo problemas, ejemplos y casos para aumentar la comprensión conceptual y práctica de mi área" },
    { id: 6, category: "Conocimiento disciplinar", text: "Articulo los contenidos de mi curso con otros campos del conocimiento" }
];

export const studentEvaluationItems = [
    { id: 1, category: "Socialización del programa", text: "El docente socializa oportunamente el programa del curso, los resultados de aprendizaje, los criterios de evaluación y las actividades a desarrollar" },
    { id: 2, category: "Adaptación del programa", text: "El docente adapta periódicamente el programa del curso a las necesidades de aprendizaje del grupo" },
    { id: 3, category: "Recursos diversos", text: "El docente emplea recursos diversos que favorecen el aprendizaje (ej. plataformas, simuladores, laboratorios, recursos bibliográficos)" },
    { id: 4, category: "Mecanismos de evaluación", text: "El docente comunica con claridad los mecanismos de evaluación y retroalimenta mis trabajos y evaluaciones" },
    { id: 5, category: "Articulación curricular", text: "El docente articula los contenidos del curso con otros cursos del programa" }
];

export const teachers = [
    { id: 1, name: "María García", department: "Matemáticas" },
    { id: 2, name: "Carlos Rodríguez", department: "Ciencias" },
    { id: 3, name: "Ana Martínez", department: "Humanidades" }
];

export const reportData = {
    department: {
        labels: ["Matemáticas", "Ciencias", "Humanidades", "Ingeniería", "Artes"],
        values: [4.2, 3.8, 4.5, 4.0, 4.7]
    },
    faculty: {
        labels: ["Facultad de Educación", "Facultad de Ingeniería", "Facultad de Ciencias", "Facultad de Humanidades"],
        values: [4.3, 4.1, 3.9, 4.4]
    },
    individual: {
        labels: evaluationItems.map(item => item.text.substring(0, 30) + "..."),
        values: [4.5, 4.2, 3.8, 4.0, 4.7, 4.3]
    },
    trends: {
        labels: ["2018", "2019", "2020", "2021", "2022", "2023"],
        values: [3.8, 3.9, 4.1, 4.2, 4.3, 4.4]
    }
};

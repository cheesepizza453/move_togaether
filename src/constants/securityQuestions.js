// 보안 질문 목록
export const SECURITY_QUESTIONS = [
  {
    id: 'elementary_school',
    question: '내가 졸업한 초등학교 이름은?'
  },
  {
    id: 'bucket_list',
    question: '나의 버킷리스트 1순위는?'
  },
  {
    id: 'treasured_item',
    question: '내가 가장 아끼는 물건은?'
  },
  {
    id: 'favorite_movie',
    question: '내가 가장 좋아하는 영화 제목은?'
  },
  {
    id: 'first_pet',
    question: '나의 첫 반려동물 이름은?'
  },
  {
    id: 'childhood_character',
    question: '내가 어릴 때 가장 좋아했던 동물 캐릭터는?'
  },
  {
    id: 'similar_animal',
    question: '나와 가장 닮은 동물은?'
  },
  {
    id: 'childhood_nickname',
    question: '나의 어린 시절 별명은?'
  },
  {
    id: 'favorite_color',
    question: '내가 가장 좋아하는 색깔은?'
  },
  {
    id: 'first_game',
    question: '내가 처음 했던 게임은?'
  }
];

// 보안 질문 ID로 질문 찾기
export const getSecurityQuestionById = (id) => {
  return SECURITY_QUESTIONS.find(q => q.id === id);
};

// 보안 질문 ID로 질문 텍스트 찾기
export const getSecurityQuestionText = (id) => {
  const question = getSecurityQuestionById(id);
  return question ? question.question : '';
};

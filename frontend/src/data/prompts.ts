export interface PromptTemplate {
  template: string;
  example: {
    description: string;
    requirements: string[];
  };
}

export interface PromptCategory {
  [key: string]: PromptTemplate;
}

export const prompts: { [key: string]: PromptCategory } = {
  react: {
    component: {
      template: `다음 React 컴포넌트를 만들어줘:
{description}

사용할 기술 스택:
- React
- TypeScript
- Material-UI

요구사항:
{requirements}`,
      example: {
        description: '사용자 프로필을 보여주는 카드 컴포넌트',
        requirements: [
          '사용자 이름, 이메일, 프로필 이미지 표시',
          '편집 버튼',
          '반응형 디자인'
        ]
      }
    },
    api: {
      template: `다음 API 엔드포인트를 만들어줘:
{description}

사용할 기술 스택:
- Node.js
- Express
- TypeScript

요구사항:
{requirements}`,
      example: {
        description: '사용자 인증 API',
        requirements: [
          '이메일/비밀번호 로그인',
          'JWT 토큰 발급',
          '에러 처리'
        ]
      }
    },
    form: {
      template: `다음 폼 컴포넌트를 만들어줘:
{description}

사용할 기술 스택:
- React Hook Form
- Yup
- Material-UI

요구사항:
{requirements}`,
      example: {
        description: '회원가입 폼',
        requirements: [
          '이름, 이메일, 비밀번호 입력 필드',
          '유효성 검사',
          '에러 메시지 표시'
        ]
      }
    },
    table: {
      template: `다음 테이블 컴포넌트를 만들어줘:
{description}

사용할 기술 스택:
- React
- Material-UI
- TypeScript

요구사항:
{requirements}`,
      example: {
        description: '데이터 그리드 테이블',
        requirements: [
          '정렬 기능',
          '페이지네이션',
          '검색 필터'
        ]
      }
    }
  },
  dataScience: {
    analysis: {
      template: `다음 데이터 분석을 수행해줘:
{description}

사용할 라이브러리:
- pandas
- numpy
- matplotlib

분석 요구사항:
{requirements}`,
      example: {
        description: '주식 데이터 분석',
        requirements: [
          '일별 가격 변동 분석',
          '이동평균선 계산',
          '거래량 분석'
        ]
      }
    },
    visualization: {
      template: `다음 데이터 시각화를 만들어줘:
{description}

사용할 라이브러리:
- matplotlib
- seaborn
- plotly

시각화 요구사항:
{requirements}`,
      example: {
        description: '판매 데이터 시각화',
        requirements: [
          '월별 판매 추이 그래프',
          '카테고리별 판매 비율 파이 차트',
          '지역별 판매량 히트맵'
        ]
      }
    },
    preprocessing: {
      template: `다음 데이터 전처리를 수행해줘:
{description}

사용할 라이브러리:
- pandas
- numpy
- scikit-learn

전처리 요구사항:
{requirements}`,
      example: {
        description: '고객 데이터 전처리',
        requirements: [
          '결측치 처리',
          '이상치 제거',
          '특성 스케일링'
        ]
      }
    },
    forecasting: {
      template: `다음 시계열 예측을 수행해줘:
{description}

사용할 라이브러리:
- statsmodels
- prophet
- scikit-learn

예측 요구사항:
{requirements}`,
      example: {
        description: '월별 매출 예측',
        requirements: [
          '계절성 분석',
          '추세 분석',
          '예측 모델 구축'
        ]
      }
    },
    clustering: {
      template: `다음 클러스터링 분석을 수행해줘:
{description}

사용할 라이브러리:
- scikit-learn
- pandas
- numpy

분석 요구사항:
{requirements}`,
      example: {
        description: '고객 세그먼트 분석',
        requirements: [
          '특성 선택',
          '클러스터 수 결정',
          '클러스터 해석'
        ]
      }
    },
    regression: {
      template: `다음 회귀 분석을 수행해줘:
{description}

사용할 라이브러리:
- scikit-learn
- statsmodels
- pandas

분석 요구사항:
{requirements}`,
      example: {
        description: '주택 가격 예측',
        requirements: [
          '특성 엔지니어링',
          '모델 선택',
          '성능 평가'
        ]
      }
    }
  },
  ai: {
    classification: {
      template: `다음 분류 모델을 만들어줘:
{description}

사용할 라이브러리:
- scikit-learn
- TensorFlow
- pandas

모델 요구사항:
{requirements}`,
      example: {
        description: '이미지 분류 모델',
        requirements: [
          'CNN 아키텍처 설계',
          '데이터 증강',
          '모델 평가 지표'
        ]
      }
    },
    nlp: {
      template: `다음 자연어 처리 작업을 수행해줘:
{description}

사용할 라이브러리:
- transformers
- nltk
- spaCy

처리 요구사항:
{requirements}`,
      example: {
        description: '텍스트 감성 분석',
        requirements: [
          '텍스트 전처리',
          'BERT 모델 활용',
          '감성 점수 계산'
        ]
      }
    },
    recommendation: {
      template: `다음 추천 시스템을 만들어줘:
{description}

사용할 라이브러리:
- scikit-learn
- pandas
- numpy

시스템 요구사항:
{requirements}`,
      example: {
        description: '콘텐츠 기반 추천 시스템',
        requirements: [
          '사용자 프로필 생성',
          '콘텐츠 특성 추출',
          '유사도 계산'
        ]
      }
    }
  }
}; 
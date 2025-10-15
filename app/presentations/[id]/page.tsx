import React from 'react';

const PresentationPage = (props: any) => {
  return (
    <div>
      <h1>Presentation {props.params.id}</h1>
    </div>
  );
};

export default PresentationPage;
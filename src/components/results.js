/**
 * Component for displaying user results
 */
const Results = (rawHTML) => {
    return (
      <div>
        <div dangerouslySetInnerHTML={{ __html: rawHTML }}></div>
      </div>
    );
  };
  
export default Results;
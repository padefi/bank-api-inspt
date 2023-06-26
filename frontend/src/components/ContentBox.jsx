export default function ContentBox({ children }) {
  return (
    <div className='box p-3 px-4 d-flex flex-column'>
      {children}
    </div>
  );
}
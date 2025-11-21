import '../../css/Dashboard/CategorySectionComponent.css';

export default function CategoryCard({ icon, label, onClick }) {
  return(
    <div 
      onClick={onClick}
      className="category-card"
    >
      <div className="category-icon">{icon}</div>
      <p className="category-label">{label}</p>
    </div>
  )
}
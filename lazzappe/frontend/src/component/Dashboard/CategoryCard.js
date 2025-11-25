import '../../css/Dashboard/CategorySectionComponent.css';

export default function CategoryCard({ icon, label, onClick }) {
  const isImage = typeof icon === 'string' && /^https?:\/\//i.test(icon);

  return(
    <div 
      onClick={onClick}
      className="category-card"
    >
      <div className="category-icon">
        {isImage ? (
          <img src={icon} alt={label} className="category-icon-img" />
        ) : (
          icon
        )}
      </div>
      <p className="category-label">{label}</p>
    </div>
  )
}
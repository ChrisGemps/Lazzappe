import NavBarComponent from "../component/Dashboard/NavBarComponent"
import FeaturedComponent from "../component/Dashboard/FeaturedComponent"
import CategorySectionComponent from "../component/Dashboard/CategorySectionComponent"

export default function Dashboard() {
return (<>

    <NavBarComponent/>
    <div className="body-wrapper">
      <FeaturedComponent/>
      <CategorySectionComponent/>

    </div>
    
  </>)

}
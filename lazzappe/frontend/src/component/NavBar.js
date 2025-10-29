

export default function NavBar(){
    return(
        <div style={{ background: "red", height: "64px", display: "flex" }}>
            <div
                style={{
                background: "green",
                height: "64px",
                display: "flex",
                flex: 2,
                alignItems: "center",   // ← vertical centering
                padding: "0 40px"        // ← left & right padding
                }}
            >
                <div style={{ flex: 1 }}>Home</div>
                <div style={{ flex: 1 }}>Catalog</div>
                <div style={{ flex: 1 }}>Gender</div>
                <div style={{ flex: 1 }}>Brands</div>
                <div style={{ flex: 1 }}>News</div>
                <div style={{ flex: 1 }}>About</div>
                <div style={{ flex: 1 }}>Contact</div>

                <div style={{display: "flex", alignItems:"center"}}>
                    <input
                        type="search"
                        placeholder="Search…"
                        style={{
                        padding: "8px 12px",
                        fontSize: "16px",
                        border: "1px solid #ccc",
                        borderRadius: "4px",
                        width: "100%",
                        maxWidth: "300px",
                        flex: 1
                        }}
                    />
                    test
                </div>

            </div>
            <div style={{ background: "blue", height: "64px", flex: 1 }}>test</div>
        </div>

        

    )
}
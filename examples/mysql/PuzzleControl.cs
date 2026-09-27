namespace Dkip;
public class PuzzleControl : UserControl
{
    readonly int[] order=[1,0,3,2];readonly Button[] tiles=new Button[4];readonly Bitmap[] fragments=new Bitmap[4];int selected=-1;
    public PuzzleControl()
    {
        Size=new Size(455,200);
        using var image=Image.FromFile(Path.Combine(AppContext.BaseDirectory,"Assets","1.png"));
        using var scaled=new Bitmap(image,200,200);
        Controls.Add(new PictureBox{Image=new Bitmap(scaled),Size=new Size(200,200),SizeMode=PictureBoxSizeMode.StretchImage});
        for(int i=0;i<4;i++){int pos=i;fragments[i]=scaled.Clone(new Rectangle(i%2*100,i/2*100,100,100),scaled.PixelFormat);tiles[i]=new Button{AccessibleName="Фрагмент "+(i+1),Name="Tile"+i,Location=new Point(235+i%2*102,i/2*100),Size=new Size(100,100),FlatStyle=FlatStyle.Flat};tiles[i].Click+=(_,_)=>{if(selected<0)selected=pos;else{(order[selected],order[pos])=(order[pos],order[selected]);selected=-1;}RefreshTiles();};Controls.Add(tiles[i]);}RefreshTiles();
    }
    public bool IsSolved()=>order.SequenceEqual(new[]{0,1,2,3});
    public void Shuffle(){do{Random.Shared.Shuffle(order);}while(IsSolved());selected=-1;RefreshTiles();}
    void RefreshTiles(){for(int i=0;i<4;i++){tiles[i].Image=fragments[order[i]];tiles[i].FlatAppearance.BorderColor=selected==i?Color.Red:Color.Gray;tiles[i].FlatAppearance.BorderSize=selected==i?3:1;}}
    protected override void Dispose(bool disposing){if(disposing){foreach(var f in fragments)f.Dispose();foreach(var p in Controls.OfType<PictureBox>())p.Image?.Dispose();}base.Dispose(disposing);}
}

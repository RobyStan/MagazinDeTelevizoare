window.onload= function(){
    document.getElementById("jucarii_sterse").innerHTML=localStorage.getItem("nume_jucarii")
    document.getElementById("ascuns").value=localStorage.getItem("nume_jucarii");

    function sorteaza(){
        semn=parseInt(document.getElementById("ordine_sortare").value)
        let jucarii= Array.from(document.getElementsByClassName("jucarie"));
        jucarii.sort(function(a,b){
            let nrc_a= a.getElementsByClassName("culori")[0].children.length;
            let nrc_b= b.getElementsByClassName("culori")[0].children.length;
            if(nrc_a==nrc_b){
                let pret_a=parseInt(a.getElementsByClassName("val-pret")[0].innerHTML);
                let pret_b=parseInt(b.getElementsByClassName("val-pret")[0].innerHTML);
                return semn*(pret_a-pret_b);
            }
            return semn*(nrc_a-nrc_b);
        });
        for (let jucarie of jucarii){
            jucarie.parentElement.appendChild(jucarie)
        }
    }
    document.getElementById("sorteaza").onclick=sorteaza;

    function filtrare(){
        
        let jucarii= document.getElementsByClassName("jucarie");
        console.log(122)
        for (let jucarie of jucarii){
            jucarie.style.display="none";
            if (jucarie.getElementsByClassName("inp")[0].checked){
                jucarie.style.display="block";
            }
        }
    }

    document.getElementById("filtrare").onclick=filtrare;

    butoane_sterge=document.getElementsByClassName("sterge");
    for(let bt of butoane_sterge){
        bt.onclick=function(){
            this.parentElement.style.display="none";
            let id_jucarie=this.id.substr(1);
            let nume_jucarie=this.name;
            //"jucarii"   "3,10,5"
            let v_iduri= localStorage.getItem("jucarii");
            let v_nume= localStorage.getItem("nume_jucarii");
            if (!v_iduri) 
                {
                    v_iduri=id_jucarie;
                    v_nume=nume_jucarie;
                }
            else{
                v_iduri+=","+id_jucarie
                v_nume+=","+nume_jucarie;
            }
            localStorage.setItem("jucarii",v_iduri);
            localStorage.setItem("nume_jucarii",v_nume);
            document.getElementById("ascuns").value=v_nume;
        }
    }

    document.getElementById("reseteaza_ls").onclick=function(){
        localStorage.clear();
        document.getElementById("jucarii_sterse").innerHTML="";
        filtrare();
        sorteaza();
    }

}
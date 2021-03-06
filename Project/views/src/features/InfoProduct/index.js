import "./style_infoproduct.css";
import React, {useEffect, useState} from "react";
import {useRouteMatch, useParams, useHistory} from "react-router-dom";
import {useSelector} from "react-redux";

import imageAPI from "../../api/imageAPI";
import productAPI from "../../api/productAPI";
import cartAPI from "../../api/cartAPI";
import SizeAPI from "../../api/sizeAPI";
import importIncoiceAPI from "../../api/importInvoice";

function InfoProduct() {
  const match = useRouteMatch();
  const {MaSP} = useParams();

  const [dataProduct, setDataProduct] = useState([]);
  const [urlImage, setUrlImage] = useState([]);
  const [size, setSize] = useState([]);
  const [SoLuongNhap, setSoLuongNhap] = useState([]);

  const history = useHistory();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await productAPI.findOne(MaSP);
        setDataProduct(data[0]);
        const ulrImage = await imageAPI.findOne(MaSP);
        setUrlImage(
          ulrImage[0].HinhAnhSP.slice(12, ulrImage[0].HinhAnhSP.length),
        );
        const sizeData = await SizeAPI.fineSize(data[0].MaKT);
        setSize(sizeData[0]);
        const soluongnhap = await importIncoiceAPI.fineOne(MaSP);
        setSoLuongNhap(soluongnhap[0].SoLuongNhap);
      } catch (error) {
        console.log(error);
      }
    };
    fetchData();
  }, [MaSP]);

  var formatNumber = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  });

  const dataCart = (username, masp, slsp) => {
    return {
      Username: username,
      MaSP: masp,
      SLSP: slsp,
    };
  };

  const isLogin = useSelector((state) => state.user.current.accessToken);
  const Username = useSelector((state) => state.user.current.username);

  const addProduct = async (MaSP) => {
    if (!isLogin) {
      localStorage.setItem("urlproduct", match.url);
      history.push("/register");
    }
    const datacart = await cartAPI.fineOne(Username, MaSP);
    console.log(datacart)
    if (datacart) {
      if(datacart[0].SLSP < SoLuongNhap){
        cartAPI.updateOne(dataCart(Username, MaSP, datacart[0].SLSP + 1));
        window.location.reload();
      }else{
        console.log("So luong vuot qua so luong san pham ton kho")
      }
    } else {
      cartAPI.create(dataCart(Username, MaSP, 1));
      window.location.reload();
    }
  };

  return (
    <div className="conatiner_infoproduct">
      <div className="wrap">
        <div className="img_product">
          <img src={urlImage} alt="hinh anh san pham" />
        </div>
        <div className="infoproduct">
          <span className="title_product">{dataProduct.TenSP}</span>
          <span className="price_product">
            {formatNumber.format(dataProduct.GiaSPX)}
          </span>
          <span className="number_product">S??? L?????ng: {SoLuongNhap}</span>
          <span className="size_product">Size: {size.KichThuocSP}</span>
          <div>
            <button
              className="btn btn_addcart"
              onClick={() => addProduct(dataProduct.MaSP)}
            >
              TH??M V??O GI??? H??NG
            </button>
            {/* <button className="btn btn_buy">MUA NGAY</button> */}
          </div>
          <div className="box_promotion">
            <span>KHUY???N M??I KHI MUA H??NG</span>
            <span>
              - Mi???n ph?? ship h??ng to??n qu???c cho ????n h??ng tr??n 2 tri???u.
            </span>{" "}
            <br />
            <span>
              - V???i ????n h??ng d?????i 2 tri???u, ph?? ship ?????ng gi?? 30k.
            </span>{" "}
            <br />
            <span>- Double Box k??m ch???ng s???c khi giao h??ng</span> <br />
            <span>- Giao h??ng nhanh 60 ph??t trong n???i th??nh C???n Th??</span> <br />
            <span>- T???ng voucher 200k v??? sinh gi??y v???i ????n h??ng tr??n 2 tri???u</span> <br />
            <span>- 1 ?????i 1 trong 7 ng??y n???u c?? l???i t??? nh?? s???n xu???t</span> <br />
          </div>
        </div>
      </div>
    </div>
  );
}

export default InfoProduct;

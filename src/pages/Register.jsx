import React, { useState } from 'react';
import { db } from '../firebase.js';
import { doc, setDoc } from 'firebase/firestore';
import './Register.css';

// Define state-wise cities mapping
const stateCityMap = {
  'Andhra Pradesh':['Visakhapatnam' ,'Vijayawada', 'Guntur', 'Nellore', 'Kurnool','Rajamahendravaram','Tirupati', 'Kakinada', 'Kadapa', 'Mangalagiri-Tadepalli','Anantapuram','Vizianagaram','Eluru', 'Ongole', 'Nandyal','Machilipatnam','Adoni', 'Proddatur','Chittoor','Hindupur','Srikakulam','Bhimavaram','Madanapalle','Tenali','Tadepalligudem','Guntakal','Dharmavaram','Gudivada','Narasaraopet','Kadiri','Tadipatri'],
  'Arunachal Pradesh':['Itanagar','Naharlagun','Pasighat','Aalo(Along)','Seppa','Namsai','Daporijo','Ziro','Tezu','Tawang','Khonsa','Bomdila','Jairampur','Deomali','Yingkiong','Changlang','Miao','Basar','Longding','Rupa','Dirang','Boleng','Anini','Koloriang','Sagalee','HawaiRoing '],
  'Assam':[' Guwahati','Silchar','Dibrugarh','Jorhat','Nagaon','Tinsukia','Tezpur','Bongaigaon','Dhubri','DiphuNorth','Lakhimpur','Karimganj','Goalpara','Sivasagar','Barpeta','Lanka','Hojai','Golaghat','Mangaldoi','Hailakandi','Kokrajhar','Nalbari','Dhemaji','Marigaon','Pathsala','Duliajan','Digboi','Lumding','Haflong','Nazira'],
  'Bihar':['Patna','Gaya','Bhagalpur','Muzaffarpur','Purnia','Darbhanga','Arrah','Begusarai','Katihar','Munger','Chhapra','Danapur','Saharsa','Sasaram','Hajipur','Dehri','Siwan','Motihari','Nawada','Bagaha','Buxar','Kishanganj','Sitamarhi','Jamalpur','Jehanabad','Aurangabad','Lakhisarai','Nalanda','Samastipur','Bettiah','Madhubani','Phusro '],
    'Chhattisgarh':['Raipur','Bhilai','Bilaspur','Korba','Rajnandgaon','Durg','Jagdalpur','Ambikapur','Dhamtari','Raigarh','Mahasamund','Champa','Bhatapara','Kanker','Sakti','Naila Janjgir','Tilda',' Newra','Bhirompur (Kawardha)MungeliManendragarhBaikunthpurKondagaonBethane (Bepatara)Gariaband '],
    'Goa':[' Vasco da Gama','Margao','Panaji','Mapusa','Ponda','Bicholim','Curchorem','Cuncolim','Marmagao','Valpoi','Pernem','Canacona','Quepem','Sanguem'],
'Gujarat':[' Ahmedabad','Surat','Vadodara','Rajkot','Bhavnagar','Jamnagar','Gandhinagar','Junagadh','Gandhidham','Anand','Navsari','Morbi','Nadiad','Surendranagar','Bharuch','Mehsana','Bhuj','Porbandar','Palanpur','Valsad','Vapi','Gondal','Veraval','Godhra','Patan','Kalol','Dahod','Botad','Amreli','Ankleshwar','Deesa','Jetpur'],
'Haryana':[' Faridabad','Gurugram (Gurgaon)','Panipat','Ambala','Yamunanagar','Rohtak','Hisar','Karnal','Sonipat','Panchkula','Sirsa','Bhiwani','Bahadurgarh','Jind','Thanesar (Kurukshetra)','Kaithal','Rewari','Palwal','Jagadhri','Hansi','Narnaul','Fatehabad','Tohana','Pinjore','Charkhi Dadri'],
'Himachal Pradesh':[' Shimla','Dharamshala ','Solan','Mandi','Palampur','Baddi','Nahan','Una','Sundernagar','Chamba','Paonta SahibKullu','Hamirpur','Manali','Bilaspur','Nalagarh','Nurpur','Parwanoo','Santokhgarh','Mehatpur Basdehra','Keylong'],
'Jharkhand':['Jamshedpur','Dhanbad','Ranchi','Bokaro Steel City','Deoghar','Phusro','Hazaribagh','Giridih','Ramgarh','Medininagar (Daltonganj)','Chas','Sahibganj','Jhumri Telaiya','Dumka Chaibasa','Ghatshila','Chakradharpur','Madhupur','Gumia','Chatra','Gumia','Godda','Gumla','Simdega','Lohardaga','Garhwa','Latehar','Pakur '],
'Karnataka':[' Bengaluru (Bangalore)','Hubballi-Dharwad (Hubli)','Mysuru (Mysore)','Kalaburagi (Gulbarga)','Mangaluru (Mangalore)','Belagavi (Belgaum)','DavanagereBallari (Bellary)','Vijayapura (Bijapur)','Shivamogga (Shimoga)','Tumakuru (Tumkur)','Raichur','Bidar','Hosapete (Hospet)','Gadag-Betageri','Hassan','Udupi','Bhadravati','Chitradurga','Kolar','Mandya','Chikkamagaluru (Chikmagalur)','Bagalkote','Ranibennur','Gangavati','Ramanagara','Karwar','Yadgir','Chamarajanagar','Chikkaballapur'],
'Kerala':['Thiruvananthapuram (Trivandrum)','Kochi (Cochin)','Kozhikode (Calicut)','Kollam (Quilon)','Thrissur (Trichur) ','Kannur (Cannanore)','Alappuzha (Alleppey)','Kottayam','Palakkad (Palghat)','Manjeri','Thalassery','Malappuram','Ponnani','Vatakara','Kanhangad','Kayamkulam','Payyanur','Kasaragod','Neyyattin','kara','Changanassery','Nedumangad','Kalpetta '],
'Madhya Pradesh':[' Indore','Bhopal','Jabalpur','Gwalior','Ujjain','Sagar','Dewas','Satna','Ratlam','Rewa','Katni','Singrauli','Burhanpur','Khandwa','Bhind','Morena','Guna','Shivpuri','Chhindwara','Vidisha','Chhatarpur','Mandsaur','Khargone','Neemuch','Pithampur','Hoshangabad (Narmadapuram)','Itarsi','Sehore','Betul','Seoni','DatiaDamoh'],
'Maharashtra':['Mumbai','Pune','Nagpur','Thane','Pimpri-Chinchwad','Nashik','Kalyan-Dombivli','Vasai-Virar','Chhatrapati Sambhajinagar (Aurangabad) ','Navi Mumbai ','Solapur ','Mira-Bhayandar','Bhiwandi-Nizampur','Amravati','Nanded-Waghala','Kolhapur','Ulhasnagar','Sangli-Miraj-Kupwad','Malegaon','Jalgaon','Akola','Latur','Dhule','Ahmednagar (Ahilyanagar)','Chandrapur','Parbhani','Ichalkaranji','Jalna','Satara','Yavatmal','Beed','Gondia','Barshi','Achalpur','Osmanabad (Dharashiv) '],
'Manipur':[' Imphal','Churachandpur','Thoubal','Kakching','Ukhrul','Senapati','Bishnupur','Moreh','Tamenglong','Chandel','Jiribam','Mayang Imphal','Lilong','Noney','Kangpokpi','Pallel'],
'Meghalaya':['Shillong','Tura ','Mawlai','Nongthymmai','Jowai ','Nongpoh ','Williamnagar','Resubelpara','Cherrapunji','Baghmara','Mairang','Dawki '],
'Mizoram':[' Aizawl','Lunglei','Champhai','Siaha','Kolasib','Serchhip','Lawngtlai','Saitual','Mamit','Khawzawl','Hnahthial '],
'Nagaland':[' Dimapur','Kohima','Mokokchung','Wokha','Tuensang','Zunheboto','Mon','Chümoukedima','Phek','Tseminyu','Pfütsero Medziphema','Kiphire','Longleng','Peren'],
'Odisha':['Bhubaneswar ','Cuttack ','Rourkela ','Berhampur (Brahmapur)','Sambalpur','Puri','Balasore (Baleswar) ','Bhadrak','Baripada','Jharsuguda ','JeyporeAnugul (Angul)','Balangir','Rayagada','Dhenkanal','Bawanipatna','Jajpur','Kendujhar (Keonjhar)','Paradip','Barbil','Sunabeda','Bargarh '],
'Punjab':[' Ludhiana','Amritsar ','Jalandhar','Patiala','Bathinda','SAS Nagar (Mohali) ','Pathankot ','Hoshiarpur ','Moga ','Abohar ','Malerkotla ','Khanna ','Phagwara','Muktsar (Sri Muktsar Sahib)','Barnala','Firozpur','Kapurthala','Zirakpur','Rajpura','Batala','Fazilka','Tarn Taran','Gurdaspur','Rupnagar (Roper)'],
'Rajasthan':['Jaipur','Jodhpur ','Kota','Bikaner','Ajmer','Udaipur','Bhilwara','Alwar ','Bharatpur','Sikar','Sri Ganganagar','Pali','Chittorgarh','Beawar','Tonk','Hanumangarh','Jhunjhunu','Kishangarh','Barmer ','Dholpur','Churu','Gangapur City','Sawai Madhopur','Nagaur','Makrana','Sujangarh','Hindaun','Bundi','Jaisalmer','Jalore '],
'Sikkim':['Gangtok','Namchi','Singtam','Rangpo','Geyzing (Gyalshing)','Jorethang','Mangan','Nayabazar','Rhenock','Pakyong '],
'Tamil Nadu':['Chennai','Coimbatore','Madurai','Tiruchirappalli (Trichy)','Tiruppur','Salem','Erode','Tirunelveli','Vellore','Thoothukudi (Tuticorin)','Nagercoil','Thanjavur','Dindigul','Hosur','Sivakasi','Kancheepuram','Karur','Cuddalore','Kumbakonam ','Tambaram','Avadi '],
'Telangana':[' Hyderabad ','Warangal','Nizamabad','Khammam ','Karimnagar','Ramagundam ','Mahbubnagar ','Nalgonda','Adilabad ','Suryapet ','Miryalaguda ','Siddipet','Mancherial ','Kothagudem'],
'Tripura':['Agartala','Dharmanagar','Udaipur','KailasaharAmbassa','Belonia','Khowai','Kumarghat','Ranirbazar','Sabroom','Teliamura','Melaghar','Sonamura','Amarpur','Jirania','Santirbazar','Kamalpur','Bishalgarh','Panisagar','Mohanpur '],
'Uttar Pradesh':[' Kanpur','Lucknow','Ghaziabad ','Agra','Meerut ','Varanasi (Kashi)','Prayagraj (Allahabad) ','Bareilly','Aligarh ','Moradabad ','Saharanpur','Gorakhpur','Noida','Firozabad','Jhansi ','Muzaffarnagar ','Mathura ','Ayodhya ','Rampur ','Shahjahanpur','Farrukhabad','Mau','Hapur ','Etawah','Mirzapur','BulandshahrSambhal ','Amroha','Hardoi','Fatehpur','Raebareli','Orai','Sitapur','Bahraich','Jaunpur '],
'Uttarakhand':[' Dehradun','Haridwar ','Haldwani-cum-Kathgodam ','Rudrapur ','Rishikesh ','Roorkee ','Kashipur','Ramnagar ','Gairsain ','Pithoragarh ','Almora','Nainital ','Kotdwar ','Srinagar ','Mussoorie ','Manglaur','Jaspur','Kichha','Ranikhet','Uttarkashi'],
'West Bengal':['Kolkata ','Howrah','Asansol ','Siliguri ','Durgapur ','.Bardhaman (Burdwan) ','Malda (English Bazar) ','Baharampur ','Kharagpur ','Haldia ','Jalpaiguri','Habra ','Shantipur ','Balurghat ','Purulia ','Midnapore (Medinipur) ','Darjeeling ','Raniganj ','Krishnanagar ','Bankura ','Cooch Behar','BasirhatBangaon','Alipurduar','Nabadwip ','Kalyani ','Suri','Rampurhat','Ghatal','Contai (Kanthi)','Bolpur (Santiniketan) ','Digha ','Jhargram ','Kalimpong ','Diamond Harbour '],

};

export default function Register({ onRegisterSuccess, onBackToLogin }) {
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    mobile: '',
    email: '',
    town: '',
    state: '',
    city: '',
    pinCode: '',
    agreeTerms: false,
  });

  // State to track error messages for each field
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Restrict mobile and pinCode to numbers only
    let processedValue = value;
    if (name === 'mobile') {
      processedValue = value.replace(/\D/g, '').slice(0, 10);
    } else if (name === 'pinCode') {
      processedValue = value.replace(/\D/g, '').slice(0, 6);
    }

    if (name === 'state') {
      // When state changes, update state and reset city selection
      setFormData({
        ...formData,
        state: value,
        city: '',
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === 'checkbox' ? checked : processedValue,
      });
    }

    // Clear error message when user starts typing/selecting
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Get available cities based on selected state
  const availableCities = formData.state ? stateCityMap[formData.state] || [] : [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    let newErrors = {};

    // Validate fields
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.surname.trim()) newErrors.surname = 'Surname is required';
    
    if (!formData.mobile) {
      newErrors.mobile = 'Mobile number is required';
    } else if (formData.mobile.length !== 10) {
      newErrors.mobile = 'Mobile number must be exactly 10 digits';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid e-mail address';
    }

    if (!formData.town.trim()) newErrors.town = 'Town is required';
    if (!formData.state) newErrors.state = 'Please select a state';
    if (!formData.city) newErrors.city = 'Please select a city';

    if (!formData.pinCode) {
      newErrors.pinCode = 'Pin code is required';
    } else if (formData.pinCode.length !== 6) {
      newErrors.pinCode = 'Pin code must be exactly 6 digits';
    }

    if (!formData.agreeTerms) {
      newErrors.agreeTerms = 'Please agree to the Terms & Conditions';
    }

    // If there are errors, set them and stop submission
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      // Save user data to Firestore database
      await setDoc(doc(db, 'users', formData.mobile), {
        name: formData.name,
        surname: formData.surname,
        mobile: formData.mobile,
        email: formData.email,
        town: formData.town,
        state: formData.state,
        city: formData.city,
        pinCode: formData.pinCode,
        createdAt: new Date()
      });

      // Success
      onRegisterSuccess();
    } catch (error) {
      console.error('Error saving user data: ', error);
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <div className="register-page-container">
      {/* Top Rounded Red Header Card */}
      <div className="register-header-card">
        <div className="badge-content">
          <img src="/images/logot.png" style={{ height: '120px' }} alt="Logo Text" />
        </div>
      </div>

      {/* Bottom Form Section */}
      <div className="register-form-section">
        <h2 className="form-title">Create a new account</h2>

        <form onSubmit={handleSubmit} className="register-form" noValidate>
          {/* Name */}
          <div className="input-group">
            <input 
              type="text" 
              name="name" 
              placeholder="Name *" 
              value={formData.name} 
              onChange={handleChange} 
            />
            {errors.name && <span className="error-text">{errors.name}</span>}
          </div>

          {/* Surname */}
          <div className="input-group">
            <input 
              type="text" 
              name="surname" 
              placeholder="Surname *" 
              value={formData.surname} 
              onChange={handleChange} 
            />
            {errors.surname && <span className="error-text">{errors.surname}</span>}
          </div>

          {/* Mobile Number */}
          <div className="input-group">
            <input 
              type="tel" 
              name="mobile" 
              placeholder="Mobile Number *" 
              value={formData.mobile} 
              onChange={handleChange} 
              maxLength={10} 
            />
            {errors.mobile && <span className="error-text">{errors.mobile}</span>}
          </div>

          {/* Email */}
          <div className="input-group">
            <input 
              type="email" 
              name="email" 
              placeholder="E-mail *" 
              value={formData.email} 
              onChange={handleChange} 
            />
            {errors.email && <span className="error-text">{errors.email}</span>}
          </div>

          {/* Town */}
          <div className="input-group">
            <input 
              type="text" 
              name="town" 
              placeholder="Town *" 
              value={formData.town} 
              onChange={handleChange} 
            />
            {errors.town && <span className="error-text">{errors.town}</span>}
          </div>

          {/* State */}
          <div className="input-group select-group">
            <select name="state" value={formData.state} onChange={handleChange}>
              <option value="" disabled>State *</option>
              {Object.keys(stateCityMap).map((stateName) => (
                <option key={stateName} value={stateName}>{stateName}</option>
              ))}
            </select>
            {errors.state && <span className="error-text">{errors.state}</span>}
          </div>

          {/* City (Dynamic based on State) */}
          <div className="input-group select-group">
            <select 
              name="city" 
              value={formData.city} 
              onChange={handleChange}
              disabled={!formData.state}
            >
              <option value="" disabled>City *</option>
              {availableCities.map((cityName) => (
                <option key={cityName} value={cityName}>{cityName}</option>
              ))}
            </select>
            {errors.city && <span className="error-text">{errors.city}</span>}
          </div>

          {/* Pin Code */}
          <div className="input-group">
            <input 
              type="text" 
              name="pinCode" 
              placeholder="Pin Code *" 
              value={formData.pinCode} 
              onChange={handleChange} 
              maxLength={6} 
            />
            {errors.pinCode && <span className="error-text">{errors.pinCode}</span>}
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="terms-container">
            <label className="checkbox-label">
              <input 
                type="checkbox" 
                name="agreeTerms" 
                checked={formData.agreeTerms} 
                onChange={handleChange} 
              />
              <span className="terms-text">
                I agree Bhada Book <strong>Terms & Conditions</strong> *
              </span>
            </label>
            {errors.agreeTerms && <span className="error-text">{errors.agreeTerms}</span>}
          </div>

          {/* Register Button */}
          <button type="submit" className="register-submit-btn">
            Register
          </button>
        </form>

        <div className="login-redirect-footer">
          Already have an account?{' '}
          <span className="login-link" onClick={onBackToLogin}>
            Log In
          </span>
        </div>
      </div>
    </div>
  );
}